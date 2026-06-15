// @hortus Carousel styles — flattened from v4 carousel.inline.scss to plain CSS
// (SCSS vars inlined: control bg #f0f0f0 / color #333 / hover #ddd / size 40px;
// $mobile -> max-width:800px) so the plugin needs no Sass build step.
// Injected as an inline stylesheet via the transformer's externalResources().
export default `
article .quartz-carousel {
  position: relative;
  width: 100%;
  margin: 2rem 0;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
article .quartz-carousel .quartz-carousel-slides {
  display: flex;
  transition: transform 0.5s ease-in-out;
}
article .quartz-carousel .quartz-carousel-slide {
  flex: 0 0 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
article .quartz-carousel .quartz-carousel-slide img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  display: block;
  transition: opacity 0.2s ease;
  cursor: zoom-in;
}
article .quartz-carousel .quartz-carousel-slide img:hover {
  opacity: 0.9;
}
article .quartz-carousel .quartz-carousel-slide .carousel-caption {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--gray);
  width: 90%;
  font-style: italic;
}
article .quartz-carousel .quartz-carousel-dots {
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem 0;
}
article .quartz-carousel .quartz-carousel-dots .dot {
  width: 10px;
  height: 10px;
  margin: 0 5px;
  background-color: #ddd;
  border-radius: 50%;
  display: inline-block;
  transition: background-color 0.3s ease;
  cursor: pointer;
}
article .quartz-carousel .quartz-carousel-dots .dot.active {
  background-color: #555;
}
article .quartz-carousel .quartz-carousel-prev,
article .quartz-carousel .quartz-carousel-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}
article .quartz-carousel .quartz-carousel-prev svg,
article .quartz-carousel .quartz-carousel-next svg {
  width: 24px;
  height: 24px;
  fill: #333;
}
article .quartz-carousel .quartz-carousel-prev:hover,
article .quartz-carousel .quartz-carousel-next:hover {
  background-color: #ddd;
}
article .quartz-carousel .quartz-carousel-prev {
  left: 10px;
}
article .quartz-carousel .quartz-carousel-next {
  right: 10px;
}

.carousel-image-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}
.carousel-image-modal .carousel-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
}
.carousel-image-modal .carousel-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.carousel-image-modal .carousel-modal-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
.carousel-image-modal .carousel-modal-caption {
  color: white;
  margin-top: 1rem;
  text-align: center;
  font-size: 1rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  max-width: 80%;
}
.carousel-image-modal .carousel-modal-close {
  position: absolute;
  top: -50px;
  right: -50px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  z-index: 10001;
}
.carousel-image-modal .carousel-modal-close svg {
  width: 24px;
  height: 24px;
  fill: #333;
}
.carousel-image-modal .carousel-modal-close:hover {
  background-color: rgba(255, 255, 255, 1);
}

html[saved-theme="dark"] article .quartz-carousel .quartz-carousel-prev,
html[saved-theme="dark"] article .quartz-carousel .quartz-carousel-next,
html[saved-theme="dark"] .carousel-image-modal .quartz-carousel-prev,
html[saved-theme="dark"] .carousel-image-modal .quartz-carousel-next {
  background-color: rgba(50, 50, 50, 0.8);
}
html[saved-theme="dark"] article .quartz-carousel .quartz-carousel-prev svg,
html[saved-theme="dark"] article .quartz-carousel .quartz-carousel-next svg,
html[saved-theme="dark"] .carousel-image-modal .quartz-carousel-prev svg,
html[saved-theme="dark"] .carousel-image-modal .quartz-carousel-next svg {
  fill: #eee;
}
html[saved-theme="dark"] article .quartz-carousel .quartz-carousel-prev:hover,
html[saved-theme="dark"] article .quartz-carousel .quartz-carousel-next:hover,
html[saved-theme="dark"] .carousel-image-modal .quartz-carousel-prev:hover,
html[saved-theme="dark"] .carousel-image-modal .quartz-carousel-next:hover {
  background-color: rgba(70, 70, 70, 0.95);
}
html[saved-theme="dark"] article .quartz-carousel .dot,
html[saved-theme="dark"] .carousel-image-modal .dot {
  background-color: #555;
}
html[saved-theme="dark"] article .quartz-carousel .dot.active,
html[saved-theme="dark"] .carousel-image-modal .dot.active {
  background-color: #ddd;
}
html[saved-theme="dark"] article .quartz-carousel .carousel-modal-close,
html[saved-theme="dark"] .carousel-image-modal .carousel-modal-close {
  background-color: rgba(50, 50, 50, 0.9);
}
html[saved-theme="dark"] article .quartz-carousel .carousel-modal-close svg,
html[saved-theme="dark"] .carousel-image-modal .carousel-modal-close svg {
  fill: #eee;
}
html[saved-theme="dark"] article .quartz-carousel .carousel-modal-close:hover,
html[saved-theme="dark"] .carousel-image-modal .carousel-modal-close:hover {
  background-color: rgba(70, 70, 70, 1);
}

@media (max-width: 800px) {
  article .quartz-carousel .quartz-carousel-prev,
  article .quartz-carousel .quartz-carousel-next {
    width: 35px;
    height: 35px;
  }
  article .quartz-carousel .quartz-carousel-prev svg,
  article .quartz-carousel .quartz-carousel-next svg {
    width: 18px;
    height: 18px;
  }
  .carousel-image-modal .carousel-modal-overlay {
    padding: 1rem;
  }
  .carousel-image-modal .carousel-modal-close {
    top: -35px;
    right: -35px;
    width: 35px;
    height: 35px;
  }
  .carousel-image-modal .carousel-modal-close svg {
    width: 20px;
    height: 20px;
  }
}
`
