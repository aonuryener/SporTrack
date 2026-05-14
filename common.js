document.addEventListener("DOMContentLoaded", function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    let adminSekmesi = "";
    let cikisButonu = "";

    if(user) {
        // Yetki kontrolü
        if(user.role === 'kurucu' || user.role === 'admin') {
            adminSekmesi = '<li><a href="admin.html" style="color:#e63946">Yönetim</a></li>';
        }
        // Menüdeki tek çıkış butonu
        cikisButonu = '<li><a href="#" onclick="cikisYap()" style="color:#999; font-size:12px; margin-left:10px;">Çıkış Yap</a></li>';
    }

    const headerHTML = `
        <a href="index.html" class="logo">SPOR<span>TRACK</span></a>
        <ul class="nav-links">
            <li><a href="index.html">Kilo Takibi</a></li>
            <li><a href="blog.html">Topluluk</a></li>
            <li><a href="hesapla.html">Hesapla</a></li>
            <li><a href="profil.html">Profilim</a></li>
            ${adminSekmesi}
            ${cikisButonu}
        </ul>`;
    
    const headerElement = document.getElementById('header-common');
    if(headerElement) headerElement.innerHTML = headerHTML;
});

function cikisYap() {
    if(confirm("Hesaptan çıkış yapılsın mı?")) {
        localStorage.removeItem('currentUser');
        window.location.href = "profil.html";
    }
}