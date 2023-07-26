from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post
from django import forms
from django.contrib.auth.decorators import login_required

# Forms
class NewPostForm(forms.ModelForm):

    class Meta:
        model = Post
        fields = ('post',)
        widgets =  {
            'post': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'What\'s on your mind?'})
        }
        labels = {
            'post': 'Create new post'
        }

def index(request):
    posts = Post.objects.all().order_by('-timestamp')

    return render(request, "network/index.html", {
        'new_post_form': NewPostForm(),
        'posts': posts     
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    
@login_required(login_url='login')
def create_post(request):
    
    # Get the form from POST
    post_form = NewPostForm(request.POST)

    # Validate form
    if post_form.is_valid():

        # Create new Post instance and assign owner
        new_post = post_form.save(commit=False)
        new_post.owner = request.user

        new_post.save()

        return HttpResponseRedirect(reverse('index'))


def profile(request, username):

    user = User.objects.get(username=username)
    posts = Post.objects.filter(owner=user).order_by('-timestamp')

    print(f'Current username: {user.username} ({user.email}) ({User.objects.filter(username=username).exists()})')

    return render(request, 'network/profile.html', {
        'username': user,
        'followed': user.followers.filter(username=request.user.username),
        'posts': posts
    })

