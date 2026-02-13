from rest_framework import serializers

from .models import User


class UserBriefSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')
        read_only_fields = fields
