document.addEventListener('DOMContentLoaded', function() {

    const posterImage = document.getElementById('poster_image');
    const modal = document.getElementById('poster_modal');
    const modalPoster = document.getElementById('modal_poster');


    posterImage.addEventListener('click', function() {
        modalPoster.src = this.src;
        modal.style.display = 'flex';
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
	
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
});