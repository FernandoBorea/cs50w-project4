from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    following = models.ManyToManyField(to='User', related_name='followers', symmetrical=False, blank=True)


class Post(models.Model):
    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name='owner')
    post = models.TextField(max_length=1000)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(to=User, related_name='liked_posts', blank=True)

    def __str__(self):
        return f'{self.owner}: {self.post}'
