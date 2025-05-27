from rest_framework import serializers

from .models import (Club, Event, EventParticipation, FinanceRecord,
                     Membership, User)


class UserSerializer(serializers.ModelSerializer):
    clubs = serializers.SerializerMethodField()
    is_admin = serializers.BooleanField(read_only=True)
    password = serializers.CharField(write_only=True, required=True)

    def get_clubs(self, obj):
        club_ids = obj.membership_set.values_list("club_id", flat=True)
        clubs = Club.objects.filter(id__in=club_ids)
        return ClubSerializer(clubs, many=True, context=self.context).data

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_admin",
            "clubs",
            "password",
            "name",
            "contact",
        ]
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
    name = serializers.CharField(source="user.name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    contact = serializers.CharField(source="user.contact", read_only=True)

    class Meta:
        model = Membership
        fields = [
            "id",
            "user",
            "username",
            "name",
            "email",
            "contact",
            "club",
            "status",
            "is_manager",
            "position",
        ]


class EventSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    my_membership = serializers.SerializerMethodField()

    def get_participants(self, obj):
        participations = obj.eventparticipation_set.all()
        return EventParticipationSerializer(participations, many=True).data

    def get_my_membership(self, obj):
        user = self.context.get("request").user
        if not user or user.is_anonymous:
            return None
        membership = Membership.objects.filter(user=user, club=obj.club).first()
        if not membership:
            return None
        return {
            "is_manager": membership.is_manager,
            "user": membership.user_id,
            "club": membership.club_id,
            "status": membership.status,
        }

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
            "payment_methods",
            "participants",
            "my_membership",
        ]


class ClubSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    activities = serializers.SerializerMethodField()
    memberCount = serializers.SerializerMethodField()
    presidentName = serializers.SerializerMethodField()

    def get_members(self, obj):
        # 回傳所有 membership，不只 accepted
        memberships = obj.membership_set.all()  # 不要加 filter(status='accepted')
        return MembershipSerializer(memberships, many=True).data

    def get_activities(self, obj):
        # 傳遞 context，讓 EventSerializer 能取得 request
        return EventSerializer(
            obj.event_set.all(), many=True, context=self.context
        ).data

    def get_memberCount(self, obj):
        return {
            "current": obj.membership_set.filter(status="accepted").count(),
            "max": obj.max_member,
        }

    def get_presidentName(self, obj):
        president = obj.membership_set.filter(
            is_manager=True, status="accepted"
        ).first()
        return president.user.username if president else None

    class Meta:
        model = Club
        fields = [
            "id",
            "name",
            "description",
            "status",
            "foundation_date",
            "memberCount",
            "members",
            "activities",
            "presidentName",
            "max_member",
        ]


class EventParticipationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    is_manager = serializers.SerializerMethodField()
    name = serializers.CharField(source="user.name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    contact = serializers.CharField(source="user.contact", read_only=True)

    def get_is_manager(self, obj):
        # 判斷該 user 是否為該活動所屬社團的幹部
        return Membership.objects.filter(
            user=obj.user, club=obj.event.club, is_manager=True, status="accepted"
        ).exists()

    class Meta:
        model = EventParticipation
        fields = [
            "id",
            "user",
            "username",
            "name",
            "email",
            "contact",
            "payment_method",
            "payment_status",
            "is_manager",
        ]


class FinanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceRecord
        fields = ["id", "club", "amount", "description", "date"]


class ParticipationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    name = serializers.CharField(source="user.name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    contact = serializers.CharField(source="user.contact", read_only=True)

    class Meta:
        model = EventParticipation
        fields = [
            "id",
            "user",
            "username",
            "name",
            "email",
            "contact",
            "payment_method",
            "payment_status",
            "is_manager",
        ]
