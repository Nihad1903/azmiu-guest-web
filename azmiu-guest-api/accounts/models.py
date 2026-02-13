import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        MANAGER = 'MANAGER', 'Manager'
        SUPERUSER = 'SUPERUSER', 'SuperUser'

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MANAGER,
    )

    class Meta:
        db_table = 'accounts_user'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.username} ({self.get_role_display()})'

    @property
    def is_manager(self):
        return self.role == self.Role.MANAGER

    @property
    def is_superuser_role(self):
        return self.role == self.Role.SUPERUSER
