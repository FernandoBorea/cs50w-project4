document.addEventListener('DOMContentLoaded', function() {
    
    // Add listeners to buttons
    document.querySelector('#follow').addEventListener('click', function() {follow_manager('follow')});
    document.querySelector('#unfollow').addEventListener('click', function() {follow_manager('unfollow')});
})

function follow_manager(action) {
    
    // Send API request to follow
    fetch('follow_api', {
        method: 'PUT',
        body: JSON.stringify({
            'target_user_id': this.dataset.targetUser,
            'action': action
        })
    })
    .then(response => response.json())
    .then(user => {
        // Code to update the follower count based on the visited profile
    })
}