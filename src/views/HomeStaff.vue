<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark py-3">
      <div class="container-fluid px-4">
        <a class="navbar-brand d-flex align-items-center" href="#">
          <img src="@/assets/image/logo.png" alt="Logo" width="35" class="me-2" />
          <span>WebGIS Sawit</span>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mx-auto gap-3 text-center">
            <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="#">About Us</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Article</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Contact</a></li>
          </ul>
          <div class="d-flex justify-content-center mt-3 mt-lg-0">
            <button class="btn btn-outline-light rounded-pill">LOGOUT →</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Carousel Hero -->
    <div id="heroCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="5000">
      <div class="carousel-inner">
        <div class="carousel-item active">
            <div class="hero-slide" :style="{ backgroundImage: 'url(' + slides[0] + ')' }"></div>
        </div>
        <div class="carousel-item">
            <div class="hero-slide" :style="{ backgroundImage: 'url(' + slides[1] + ')' }"></div>
        </div>
        <div class="carousel-item">
            <div class="hero-slide" :style="{ backgroundImage: 'url(' + slides[2] + ')' }"></div>
        </div>
      </div>

      <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
      <div class="carousel-caption d-flex flex-column justify-content-center align-items-center">
        <h1 class="display-4 fw-bold">Website Sistem<br />Informasi Geografis<br />Kebun Sawit</h1>
        <p class="lead">Lampung, Indonesia</p>
        <a href="#" class="btn btn-custom mt-3">PETA KEBUN →</a>
      </div>
    </div>

    <!-- About Us Section -->
    <section class="about-section py-5">
      <div class="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-5">
        <div class="about-text col-md-6">
          <h2 class="fw-bold mb-3">About Us</h2>
          <h5 class="mb-3">Selamat Datang di Website Kebun Sawit Lampung!</h5>
          <p>
            Perkebunan kelapa sawit merupakan salah satu industri yang memberikan kontribusi signifikan terhadap perekonomian di Indonesia...
          </p>
          <a href="#" class="btn btn-readmore mt-3">Read more →</a>
        </div>
        <div class="about-img col-md-5">
          <img src="@/assets/image/about.png" alt="Petani Sawit" class="img-fluid rounded-4 shadow" />
        </div>
      </div>
    </section>

    <!-- Layer Section -->
    <section class="layer-section">
      <div class="container">
        <div class="layer-content">
          <div class="map-box">
            <img src="@/assets/image/peta.png" alt="Peta Kebun Sawit" />
            <a href="#" class="map-button">Click Here ⤵</a>
          </div>
          <div class="layer-list">
            <h2>Layer</h2>
            <ul>
              <li><span class="checkmark">✔</span> Batas Wilayah</li>
              <li><span class="checkmark">✔</span> Pohon Sawit</li>
              <li><span class="checkmark">✔</span> Jalur Irigasi</li>
              <li><span class="checkmark">✔</span> Jalan</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Article Section -->
    <section class="article-section">
      <div class="quote-section">
        <div class="quote-text">“Our commitment to green energy is paving the way for a cleaner, healthier planet.”</div>
        <a href="#" class="cta-button">Get in touch</a>
      </div>
    </section>
  </div>
</template>

<script>
import sawit1 from '@/assets/image/sawit1.png'
import sawit2 from '@/assets/image/sawit2.jpg'
import sawit3 from '@/assets/image/sawit3.jpg'

export default {
  name: 'HomeStaff',
  data() {
    return {
      slides: [sawit1, sawit2, sawit3]
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/staff.css';
</style>
