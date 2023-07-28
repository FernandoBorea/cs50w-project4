
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create_post", views.create_post, name="create_post"),
    path("users/<str:username>", views.profile, name="profile"),
    path('follow_api', views.follow, name='follow_api'),
    path('following_posts', views.following_posts, name='following_posts'),
    path('edit_post/<int:post_id>', views.edit_post, name='edit_post')
]
