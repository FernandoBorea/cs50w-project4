document.addEventListener('DOMContentLoaded', function() {
    
    // Add listeners to buttons
    follow = document.querySelector('#follow')
    
    if (follow !== null) {
        follow.addEventListener('click', function() {follow_manager('follow')});
    }
    
    unfollow = document.querySelector('#unfollow');

    if (unfollow !== null) {
        unfollow.addEventListener('click', function() {follow_manager('unfollow')});
    }

    // Add listener to post edit links
    document.querySelectorAll('.edit_post').forEach(function(element) {
        element.addEventListener('click', edit_post);
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
            follow_button.removeEventListener('click', null);
            follow_button.addEventListener('click', function () {follow_manager('unfollow')});
        } else {
            const unfollow_button = document.querySelector('#unfollow');
            unfollow_button.id = 'follow';
            unfollow_button.innerHTML = 'Follow';
            unfollow_button.removeEventListener('click', null);
            unfollow_button.addEventListener('click', function () {follow_manager('follow')});
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
        like_sep.innerHTML = '~';
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