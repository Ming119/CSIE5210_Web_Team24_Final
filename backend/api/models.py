from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
  is_admin = models.BooleanField(default=False)

class Club(models.Model):
  name = models.CharField(max_length=255)
  description = models.TextField()
  status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('pending', 'Pending'),
            ('rejected', 'Rejected'),
            ('suspended', 'Suspended'),
            ('disbanded', 'Disbanded'),
        ],
        default='pending'
    )
  max_member = models.PositiveIntegerField()
  foundation_date = models.DateField(auto_now_add=True)

  @property
  def member_count(self):
    return Membership.objects.filter(club=self, status='accepted').count()

class Membership(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  club = models.ForeignKey(Club, on_delete=models.CASCADE)
  status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='pending')
  is_manager = models.BooleanField(default=False)
  position = models.CharField(max_length=20, blank=True, null=True)
  class Meta:
    unique_together = ('user', 'club')

class Event(models.Model):
  club = models.ForeignKey(Club, on_delete=models.CASCADE)
  name = models.CharField(max_length=255)
  description = models.TextField()
  quota = models.IntegerField(default=0)
  status = models.CharField(
        max_length=20,
        choices=[
            ('planning', '規劃中'),
            ('ongoing', '進行中'),
            ('completed', '已結束'),
        ],
        default='planning'
    )
  start_date = models.DateField()
  end_date = models.DateField()
  fee = models.PositiveIntegerField(default=0)
  payment_methods = models.JSONField(default=dict)

  @property
  def participant_count(self):
    return EventParticipation.objects.filter(event=self).count()
  
class EventParticipation(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  event = models.ForeignKey(Event, on_delete=models.CASCADE)

  class Meta:
    unique_together = ('user', 'event')

class FinanceRecord(models.Model):
  club = models.ForeignKey(Club, on_delete=models.CASCADE)
  amount = models.DecimalField(max_digits=10, decimal_places=2)
  description = models.TextField()
  date = models.DateField()
