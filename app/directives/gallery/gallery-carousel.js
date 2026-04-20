/**
 * rvCarousel — Sincroniza o scroll horizontal de um carrossel com o índice
 * ativo no post, para que os dots indicator se atualizem em tempo real.
 *
 * Uso: <div class="carousel-track" rv-carousel="post">...</div>
 *
 * rvVideoObs — F2: autoplay muted quando o vídeo entra no viewport;
 * pausa quando sai. Usa IntersectionObserver.
 *
 * Uso: <video rv-video-obs ...></video>
 */
angular.module('rotaViva')

.directive('rvCarousel', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var el = element[0];

            el.addEventListener('scroll', function() {
                if (!el.offsetWidth) return;
                var idx = Math.round(el.scrollLeft / el.offsetWidth);
                var post = scope.$eval(attrs.rvCarousel);
                if (post && post._carouselIndex !== idx) {
                    scope.$apply(function() {
                        post._carouselIndex = idx;
                    });
                }
            }, { passive: true });

            // Register programmatic scroll function for arrow buttons
            var post = scope.$eval(attrs.rvCarousel);
            if (post) {
                post._carouselScrollTo = function(idx) {
                    el.scrollTo({ left: idx * el.offsetWidth, behavior: 'smooth' });
                };
            }
        }
    };
})

.directive('rvVideoObs', function() {
    return {
        restrict: 'A',
        link: function(scope, element) {
            var video = element[0];
            if (!video || !('IntersectionObserver' in window)) return;

            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        video.muted = !!scope.videoMuted;
                        video.play().catch(function() {});
                    } else {
                        video.pause();
                    }
                });
            }, { threshold: 0.6 });

            observer.observe(video);

            // Keep muted in sync when user toggles the global flag
            scope.$watch('videoMuted', function(val) {
                video.muted = !!val;
            });

            scope.$on('$destroy', function() {
                observer.disconnect();
            });
        }
    };
});
