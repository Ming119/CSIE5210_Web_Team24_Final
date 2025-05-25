from rest_framework import serializers

from .models import (Club, Event, EventParticipation, FinanceRecord,
                     Membership, User)


class UserSerializer(serializers.ModelSerializer):
    clubs = serializers.SerializerMethodField()
    is_admin = serializers.BooleanField(read_only=True)
    password = serializers.CharField(write_only=True, required=True)

    def get_clubs(self, obj):
        # 透過 Membership 查詢用戶參與的社團
        club_ids = obj.membership_set.values_list("club_id", flat=True)
        clubs = Club.objects.filter(id__in=club_ids)
        return ClubSerializer(clubs, many=True).data

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    class Meta:
        model = User
        fields = ["id", "username", "email", "is_admin", "clubs", "password"]
        read_only_fields = ["is_admin"]


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]


class MembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = Membership
        fields = ["id", "user", "username", "club", "status", "is_manager", "position"]

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "description",
            "fee",
            "quota",
            "status",
            "start_date",
            "end_date",
            "club",
        ]
        read_only_fields = ("club",)

class ClubSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    activities = serializers.SerializerMethodField()
    memberCount = serializers.SerializerMethodField()
    presidentName = serializers.SerializerMethodField()

    def get_members(self, obj):
        return MembershipSerializer(obj.membership_set.filter(status="accepted"), many=True).data

    def get_activities(self, obj):
        return EventSerializer(obj.event_set.all(), many=True).data

    def get_memberCount(self, obj):
        return {
            "current": obj.membership_set.filter(status="accepted").count(),
            "max": obj.max_member,
        }

    def get_presidentName(self, obj):
        president = obj.membership_set.filter(is_manager=True, status="accepted").first()
        return president.user.username if president else None

    class Meta:
        model = Club
        fields = [
            "id", "name", "description", "status", "foundation_date",
            "memberCount", "members", "activities", "presidentName", "max_member"
        ]

class EventParticipationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    event = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = EventParticipation
        fields = ["id", "user", "event"]
        read_only_fields = ["user", "event"]


class FinanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceRecord
        fields = ["id", "club", "amount", "description", "date"]
