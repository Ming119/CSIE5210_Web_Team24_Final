from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
  is_admin = models.BooleanField(default=False)

class Club(models.Model):
  name = models.CharField(max_length=255)
  description = models.TextField()

  @property
  def member_count(self):
    return Membership.objects.filter(club=self, status='accepted').count()

class Membership(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  club = models.ForeignKey(Club, on_delete=models.CASCADE)
  status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='pending')
  is_manager = models.BooleanField(default=False)

  class Meta:
    unique_together = ('user', 'club')

class Event(models.Model):
  club = models.ForeignKey(Club, on_delete=models.CASCADE)
  name = models.CharField(max_length=255)
  description = models.TextField()
  max_participants = models.IntegerField(default=0)
  is_public = models.BooleanField(default=True)

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
