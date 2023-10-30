window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const coupons = urlParams.get('coupons');

    if (coupons) {
        document.getElementById("earnedCoupons").innerText = coupons + " Coupons";
    } else {
        // Handle the scenario where the coupon parameter might not be present in the URL.
        // You can show an error or a default message based on your requirements.
        document.getElementById("earnedCoupons").innerText = "Unable to fetch coupon details.";
    }
}
