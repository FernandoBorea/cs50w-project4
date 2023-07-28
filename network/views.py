from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post
from django import forms
from django.contrib.auth.decorators import login_required
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.paginator import Paginator

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


# class EditPostForm(forms.Form):
#     post_id = forms.IntegerField(required=True)
#     post_body = forms.Textarea(max_lenght=1000)

#     widget


def index(request):

    # Get all posts and create paginator
    posts = Post.objects.all().order_by('-timestamp')
    paginator = Paginator(posts, 10)

    # Try to get the visited page number
    page = request.GET.get('page', '1')

    # Validate, if validation fails, render page 1
    try:
        page = int(page)
    except ValueError:
        return HttpResponseRedirect(reverse('index'))

    # If visited page is out of range, render page 1
    if page > paginator.num_pages:
        return HttpResponseRedirect(reverse('index'))

    # If no errors are generated, return the visited page
    page_obj = paginator.get_page(page)
    return render(request, "network/index.html", {
        'new_post_form': NewPostForm(),
        'posts': page_obj,
        'page_count': range(1, paginator.num_pages + 1),
        'pages': paginator.num_pages,
        'page': page
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

    paginator = Paginator(posts, 10)

    # Try to get the visited page number
    page = request.GET.get('page', '1')

    # Validate, if validation fails, render page 1
    try:
        page = int(page)
    except ValueError:
        return HttpResponseRedirect(reverse('profile', kwargs={'username': username}))

    # If visited page is out of range, render page 1
    if page > paginator.num_pages:
        return HttpResponseRedirect(reverse('profile', kwargs={'username': username}))

    # If no errors are generated, return the visited page
    page_obj = paginator.get_page(page)
    return render(request, "network/profile.html", {
        'username': user,
        'followed': user.followers.filter(username=request.user.username).exists(),
        'posts': page_obj,
        'page_count': range(1, paginator.num_pages + 1),
        'pages': paginator.num_pages,
        'page': page
    })


@csrf_exempt
@login_required(login_url='login')
def follow(request):
    
    if request.method == 'PUT':

        data = json.loads(request.body)
        user = request.user

        if data.get('target_user_id') is not None:
            target_user = User.objects.get(pk=data['target_user_id'])
            
            if data.get('action') is not None and data.get('action') == 'follow':
                user.following.add(target_user)
            
            elif data.get('action') is not None and data.get('action') == 'unfollow':
                user.following.remove(target_user)
            
            user.save()

            return JsonResponse({
                'followers': target_user.followers.count(),
                'following': target_user.following.count()
            }, status=200)
    
    return HttpResponseRedirect(reverse('index'))


@login_required(login_url='login')
def following_posts(request):

    following_users = request.user.following.all()
    posts = Post.objects.filter(owner__in = following_users).order_by('-timestamp')
    paginator = Paginator(posts, 10)

    # Try to get the visited page number
    page = request.GET.get('page', '1')

    # Validate, if validation fails, render page 1
    try:
        page = int(page)
    except ValueError:
        return HttpResponseRedirect(reverse('following_posts'))

    # If visited page is out of range, render page 1
    if page > paginator.num_pages:
        return HttpResponseRedirect(reverse('following_posts'))

    # If no errors are generated, return the visited page
    page_obj = paginator.get_page(page)
    return render(request, "network/following.html", {
        'posts': page_obj,
        'page_count': range(1, paginator.num_pages + 1),
        'pages': paginator.num_pages,
        'page': page
    })


def edit_post(request, post_id):

    post = Post.objects.get(pk=post_id)

    if request.method == 'POST':
        form = NewPostForm(request.POST)

        if form.is_valid():
            post.post = form.cleaned_data['post']
            post.save()

            return HttpResponse(status=204)
        
    
    form = NewPostForm(instance=post)

    return render(request,'network/edit_post_form.html', {
        'form': form,
        'post': post
    })
