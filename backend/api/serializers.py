from rest_framework import serializers
from .models import User, Club, Event, FinanceRecord, Membership, EventParticipation

class UserSerializer(serializers.ModelSerializer):
  clubs = serializers.SerializerMethodField()
  def get_clubs(self, obj):
    return ClubSerializer(obj.club_set.all(), many=True).data
  class Meta:
    model = User
    fields = ['id', 'username', 'email', 'is_admin', 'clubs']
    read_only_fields = ['is_admin']

class ClubSerializer(serializers.ModelSerializer):
  members = serializers.SerializerMethodField()
  def get_members(self, obj):
    return MembershipSerializer(obj.membership_set.filter(status='accepted'), many=True).data
  
  class Meta:
    model = Club
    fields = ['id', 'name', 'description', 'member_count', 'members']

class MembershipSerializer(serializers.ModelSerializer):
  user = serializers.PrimaryKeyRelatedField(read_only=True)
  club = serializers.PrimaryKeyRelatedField(read_only=True)
  class Meta:
    model = Membership
    fields = ['id', 'user', 'club', 'status', 'is_manager']
    read_only_fields = ['user', 'club']

class EventSerializer(serializers.ModelSerializer):
  participants = serializers.SerializerMethodField()
  def get_participants(self, obj):
    return EventParticipationSerializer(obj.eventparticipation_set.all(), many=True).data
  class Meta:
    model = Event
    fields = ['id', 'club', 'name', 'description', 'is_public', 'max_participants', 'participant_count', 'participants']

class EventParticipationSerializer(serializers.ModelSerializer):
  user = serializers.PrimaryKeyRelatedField(read_only=True)
  event = serializers.PrimaryKeyRelatedField(read_only=True)
  class Meta:
    model = EventParticipation
    fields = ['id', 'user', 'event']
    read_only_fields = ['user', 'event']

class FinanceRecordSerializer(serializers.ModelSerializer):
  class Meta:
    model = FinanceRecord
    fields = ['id', 'club', 'amount', 'description', 'date']