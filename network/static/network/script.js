// Prepare anonymous functions
const follow_listener = function() {follow_manager('follow')};
const unfollow_listener = function() {follow_manager('unfollow')};
const like_listener = function () {like_post('like')};
const unlike_listener = function () {like_post('unlike')};

document.addEventListener('DOMContentLoaded', function() {
    
    // Add listeners to buttons
    follow = document.querySelector('#follow')
    
    if (follow !== null) {
        follow.addEventListener('click', follow_listener);
    }
    
    unfollow = document.querySelector('#unfollow');

    if (unfollow !== null) {
        unfollow.addEventListener('click', unfollow_listener);
    }

    // Add listener to post edit and like buttons
    document.querySelectorAll('.edit_post').forEach(function(element) {
        element.addEventListener('click', edit_post);
    });

    document.querySelectorAll('.like_post').forEach(function(element) {
        element.addEventListener('click', like_listener);
    });

    document.querySelectorAll('.unlike_post').forEach(function(element) {
        element.addEventListener('click', unlike_listener);
    });

});

function follow_manager(action) {
    
    const button = event.target;

    // Send API request to follow
    fetch('/follow_api', {
        method: 'PUT',
        body: JSON.stringify({
            'target_user_id': button.dataset.targetuser,
            'action': action
        })
    })
    .then(response => response.json())
    .then(data => {
        
        // Update with the new follower count and update buttons
        document.querySelector('#followers').innerHTML = `Followers: ${data.followers}`;
        document.querySelector('#following').innerHTML = `Following: ${data.following}`;

        if (action === 'follow') {
            const follow_button = document.querySelector('#follow');
            follow_button.id = 'unfollow';
            follow_button.innerHTML = 'Unfollow';
            follow_button.removeEventListener('click', follow_listener);
            follow_button.addEventListener('click', unfollow_listener);
        } else {
            const unfollow_button = document.querySelector('#unfollow');
            unfollow_button.id = 'follow';
            unfollow_button.innerHTML = 'Follow';
            unfollow_button.removeEventListener('click', unfollow_listener);
            unfollow_button.addEventListener('click', follow_listener);
        }
    })
}

function edit_post() {

    // Request post form
    const post_id = this.dataset.targetpost;

    // Request the HTML form
    fetch(`/edit_post/${post_id}`)
    .then(response => response.text())
    .then(form => {
        document.querySelector(`#post${post_id}`).innerHTML = form;
        document.querySelector(`#edit-post${post_id}-form`).addEventListener('submit', () => post_editor(post_id));
    })
}

function post_editor(post_id) {
    
    // Get the form
    const form = document.querySelector(`#edit-post${post_id}-form`);

    // Create new FormData and Request object
    const formData = new FormData(form);
    const request = new Request(`/edit_post/${post_id}`, {
        method: 'POST',
        body: formData
    });

    // Make request
    fetch(request)
    .then(response => response.json())
    .then(data => {

        // Get and clean the post container
        const post_container = document.querySelector(`#post${post_id}`);
        post_container.innerHTML = '';

        // Build inner elements
        const post_content = document.createElement('h6');
        post_content.innerHTML = data.post;

        const like_button = document.createElement('a');
        like_button.href = '#';
        like_button.innerHTML = 'Like';

        const like_sep = document.createElement('span');
        like_sep.innerHTML = ' ~ ';
        like_sep.className = 'text-muted';

        const like_count = document.createElement('p');
        like_count.className = 'm-0 like-count text-muted';
        like_count.innerHTML = '0';

        const button_span = document.createElement('span');
        button_span.className = 'text-muted';
        button_span.innerHTML = '&nbsp;';

        const edit_button = document.createElement('button');
        edit_button.className = 'text-muted btn btn-link edit_post';
        edit_button.dataset.targetpost = post_id;
        edit_button.innerHTML = 'Edit post';

        // Assembly 
        button_span.append(edit_button);

        post_container.append(post_content);
        post_container.append(like_button);
        post_container.append(like_sep);
        post_container.append(like_count);
        post_container.append(button_span);
    });

    // Prevent form submission
    event.preventDefault();
}


function like_post(action) {

    const button = event.target;
    const post_id = button.dataset.targetpost;

    // Send API request to follow
    fetch(`/like/${post_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            'action': action
        })
    })
    .then(response => response.json())
    .then(data => {
        document.querySelector(`#post${post_id}likes`).innerHTML = data.like_count;

        if (action == 'like') {
            button.className = 'btn btn-link unlike_post p-0 border-0';
            button.innerHTML = 'Unlike';
            button.removeEventListener('click', like_listener);
            button.addEventListener('click', unlike_listener);

        } else {
            button.className = 'btn btn-link like_post p-0 border-0';
            button.innerHTML = 'Like';
            button.removeEventListener('click', unlike_listener);
            button.addEventListener('click', like_listener);
        }
    });
}