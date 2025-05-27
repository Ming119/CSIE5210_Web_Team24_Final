from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    name = models.CharField(max_length=100, blank=True, null=True)
    contact = models.CharField(max_length=100, blank=True, null=True)


class Club(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ("active", "營運中"),
            ("pending", "待審核"),
            ("rejected", "已拒絕"),
            ("suspended", "暫停營運"),
            ("disbanded", "已解散"),
        ],
        default="pending",
    )
    max_member = models.PositiveIntegerField()
    foundation_date = models.DateField(auto_now_add=True)
    image = models.ImageField(upload_to="club_images/", blank=True, null=True)

    @property
    def member_count(self):
        return Membership.objects.filter(club=self, status="accepted").count()


class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=10,
        choices=[
            ("pending", "待審核"),
            ("accepted", "已加入"),
            ("rejected", "已拒絕"),
            ("left", "已退出"),
        ],
        default="pending",
    )
    is_manager = models.BooleanField(default=False)
    position = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        unique_together = ("user", "club")


class Event(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()
    quota = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=[
            ("planning", "尚未接受報名"),
            ("open", "接受報名中"),
            ("closed", "已截止報名"),
            ("completed", "已結束"),
            ("cancelled", "已取消"),
        ],
        default="planning",
    )
    start_date = models.DateField()
    end_date = models.DateField()
    fee = models.PositiveIntegerField(default=0)
    payment_methods = models.JSONField(default=dict)
    is_public = models.BooleanField(default=False, verbose_name="公開活動")

    @property
    def participant_count(self):
        return EventParticipation.objects.filter(event=self).count()


class EventParticipation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    payment_method = models.CharField(max_length=20, blank=True, null=True)
    payment_status = models.CharField(
        max_length=20,
        choices=[("pending", "待確認"), ("confirmed", "已確認")],
        default="pending",
    )

    class Meta:
        unique_together = ("user", "event")


class FinanceRecord(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    date = models.DateField()
