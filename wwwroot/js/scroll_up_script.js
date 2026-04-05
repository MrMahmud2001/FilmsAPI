const scrollToTopBtn = document.getElementById('scrollToTopBtn');

			
			window.addEventListener('scroll', function() {
				if (window.scrollY > 300) { 
					scrollToTopBtn.style.display = 'flex';
				} else {
					scrollToTopBtn.style.display = 'none';
				}
			});

		
			scrollToTopBtn.addEventListener('click', function() {
				window.scrollTo({
					top: 0,
					behavior: 'smooth' 
				});
			});
			