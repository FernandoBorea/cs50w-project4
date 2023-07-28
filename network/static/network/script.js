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
        console.log(element);
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
    console.log(this)
    return false;
}