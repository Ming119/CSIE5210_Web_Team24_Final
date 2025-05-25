from rest_framework import generics, status, views
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (Club, Event, EventParticipation, FinanceRecord,
                     Membership, User)
from .permissions import CanViewEvent, IsAdmin, IsClubManager
from .serializers import (ClubSerializer, EventSerializer,
                          FinanceRecordSerializer, UserRegisterSerializer,
                          UserSerializer)


class RegisterView(generics.CreateAPIView):
  queryset = User.objects.all()
  serializer_class = UserRegisterSerializer
  permission_classes = [AllowAny]
  def perform_create(self, serializer):
    user = serializer.save()
    user.set_password(serializer.validated_data['password'])
    user.save()

class UserSelfView(generics.RetrieveUpdateAPIView):
  serializer_class = UserSerializer
  permission_classes = [IsAuthenticated]
  def get_object(self):
    return self.request.user

class UserAdminListView(generics.ListCreateAPIView):
  queryset = User.objects.filter(is_admin=False)
  serializer_class = UserSerializer
  permission_classes = [IsAdmin]

class UserAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
  queryset = User.objects.filter(is_admin=False)
  serializer_class = UserSerializer
  permission_classes = [IsAdmin]

class ClubApproveView(views.APIView):
    permission_classes = [IsAdmin]  # 只允許管理員

    def post(self, request, club_id):
        club = Club.objects.get(id=club_id)
        action = request.data.get('action')
        if action == 'approve':
            club.status = 'active'
        elif action == 'reject':
            club.status = 'rejected'
        elif action == 'suspend':
            club.status = 'suspended'
        elif action == 'disband':
            club.status = 'disbanded'
        else:
            return Response({'detail': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        club.save()
        return Response({'status': club.status})

class ClubListView(generics.ListCreateAPIView):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        club = serializer.save()
        # 建立者自動成為社長
        Membership.objects.create(
            user=self.request.user,
            club=club,
            status='accepted',
            is_manager=True,
            position="社長"
        )

class MyClubsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if hasattr(user, "is_admin") and user.is_admin:
            clubs = Club.objects.all()
        else:
            memberships = Membership.objects.filter(user=user)
            clubs = Club.objects.filter(id__in=memberships.values_list('club_id', flat=True))
        serializer = ClubSerializer(clubs, many=True, context={'request': request})
        return Response(serializer.data)
    
class ClubDetailView(RetrieveUpdateAPIView):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [AllowAny]
    

class ClubJoinView(views.APIView):
  permission_classes = [IsAuthenticated]
  def post(self, request, club_id):
    club = Club.objects.get(id=club_id)
    Membership.objects.get_or_create(user=request.user, club=club, defaults={'is_manager': False})
    return Response(status=status.HTTP_200_OK)

class EventListView(generics.ListCreateAPIView):
  serializer_class = EventSerializer
  permission_classes = [IsAuthenticated & IsClubManager | AllowAny]
  def get_queryset(self):
    club_id = self.kwargs['club_id']
    queryset = Event.objects.filter(club_id=club_id)
    if not self.request.user.is_authenticated or not Membership.objects.filter(user=self.request.user, club_id=club_id).exists():
      queryset = queryset.filter(is_public=True)
    return queryset
  def perform_create(self, serializer):
    serializer.save(club_id=self.kwargs['club_id'])

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
  queryset = Event.objects.all()
  serializer_class = EventSerializer
  permission_classes = [CanViewEvent | (IsAuthenticated & IsClubManager)]

class EventJoinView(views.APIView):
  permission_classes = [IsAuthenticated]
  def post(self, request, event_id):
    event = Event.objects.get(id=event_id)
    if event.is_public or Membership.objects.filter(user=request.user, club=event.club).exists():
      EventParticipation.objects.get_or_create(user=request.user, event=event)
      return Response(status=status.HTTP_200_OK)
    return Response({"detail": "Cannot join private event of unjoined club"}, status=status.HTTP_403_FORBIDDEN)

class FinanceRecordListView(generics.ListCreateAPIView):
  serializer_class = FinanceRecordSerializer
  permission_classes = [IsAuthenticated, IsClubManager]
  def get_queryset(self):
    return FinanceRecord.objects.filter(club_id=self.kwargs['club_id'])
  def perform_create(self, serializer):
    serializer.save(club_id=self.kwargs['club_id'])

class FinanceRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = FinanceRecordSerializer
  permission_classes = [IsAuthenticated, IsClubManager]
  def get_queryset(self):
    return FinanceRecord.objects.filter(club_id=self.kwargs['club_id'])

class FinanceStatsView(views.APIView):
  permission_classes = [IsAuthenticated, IsClubManager]
  def get(self, request, club_id):
    records = FinanceRecord.objects.filter(club_id=club_id)
    total = sum(record.amount for record in records)
    return Response({"total": total})
  
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
        }
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer