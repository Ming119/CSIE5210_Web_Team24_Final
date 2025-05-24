from rest_framework import permissions
from .models import Membership


class IsAdmin(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.user.is_authenticated and request.user.is_admin

class IsClubManager(permissions.BasePermission):
  def has_permission(self, request, view):
    club_id = view.kwargs.get('club_id') or (request.data.get('club') if request.method in ['POST', 'PUT'] else None)
    if not club_id:
      return False
    return request.user.is_authenticated and Membership.objects.filter(
      user=request.user, club_id=club_id, is_manager=True
    ).exists()

class CanViewEvent(permissions.BasePermission):
  def has_object_permission(self, request, view, obj):
    if obj.is_public:
      return True
    return Membership.objects.filter(user=request.user, club=obj.club).exists()