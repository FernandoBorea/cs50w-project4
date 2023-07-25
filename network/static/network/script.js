document.addEventListener('DOMContentLoaded', function() {
    
    // Add listeners to buttons
    document.querySelector('#my-profile').addEventListener('click', () => load_profile());
    document.querySelector('#all-posts').addEventListener('click', () => load_posts('all'));
    document.querySelector('#following-posts').addEventListener('click', () => load_posts('following'));
})