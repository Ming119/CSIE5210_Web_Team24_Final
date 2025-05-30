# from django.urls import path, include
# from rest_framework.routers import DefaultRouter

# from .views import (
#   ClubViewSet,
#   MemberViewSet,
#   ClubMembershipViewSet,
#   ActivityViewSet,
#   ActivityParticipationViewSet,
#   TransactionViewSet,
# )

# router = DefaultRouter()
# router.register(r'clubs', ClubViewSet, basename='club')
# router.register(r'members', MemberViewSet, basename='member')
# router.register(r'club-memberships', ClubMembershipViewSet, basename='club-membership')
# router.register(r'activities', ActivityViewSet, basename='activity')
# router.register(r'activity-participations', ActivityParticipationViewSet, basename='activity-participation')
# router.register(r'transactions', TransactionViewSet, basename='transaction')

# urlpatterns = [
#     path('api', include(router.urls)), 
# ]

from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (TokenObtainPairView,
                                            TokenRefreshView)

from . import views
from .views import MyClubsView

router = DefaultRouter()

urlpatterns = [
  path('register/', views.RegisterView.as_view(), name='register'),
  #path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
  path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
  path('me/', views.UserSelfView.as_view(), name='user_self'),
  path('users/', views.UserAdminListView.as_view(), name='user_list_admin'),
  path('users/<int:pk>/', views.UserAdminDetailView.as_view(), name='user_detail_admin'),
  path('clubs/', views.ClubListView.as_view(), name='club_list'),
  path('clubs/<int:club_id>/join/', views.ClubJoinView.as_view(), name='club_join'),
  path('clubs/<int:club_id>/events/', views.EventListView.as_view(), name='event_list'),
  path('clubs/<int:club_id>/events/<int:pk>/', views.EventDetailView.as_view(), name='event_detail'),
  path('events/<int:event_id>/join/', views.EventJoinView.as_view(), name='event_join'),
  path('clubs/<int:club_id>/finances/', views.FinanceRecordListView.as_view(), name='finance_list'),
  path('clubs/<int:club_id>/finances/<int:pk>/', views.FinanceRecordDetailView.as_view(), name='finance_detail'),
  path('clubs/<int:club_id>/finances/stats/', views.FinanceStatsView.as_view(), name='finance_stats'),
  path('myclubs/', MyClubsView.as_view(), name='myclubs'),
  path('clubs/<int:club_id>/approve/', views.ClubApproveView.as_view(), name='club_approve'),
  path('clubs/<int:pk>/', views.ClubDetailView.as_view(), name="club-detail"),
  path('login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
  path('memberships/<int:pk>/', views.MembershipDetailView.as_view(), name='membership-detail'),
  path('events/<int:event_id>/participants/<int:pk>/', views.EventParticipantDetailView.as_view(), name='event_participant_detail'),
  
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)