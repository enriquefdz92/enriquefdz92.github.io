let checkin_date, checkin_div, checkin_dp,
    checkout_date, checkout_div, checkout_dp;

// function for udpating displayed date in button
function update() {
    if (checkin_date !== undefined && checkout_date !== undefined) {
        console.log(checkin_date);

        start = checkin_date.getFullYear() + "-" + (checkin_date.getMonth() + 1) + "-" + checkin_date.getDate();
        end = checkout_date.getFullYear() + "-" + (checkout_date.getMonth() + 1) + "-" + checkout_date.getDate();
        console.log(checkin_date);
        console.log(checkout_date);
        getClases(start, end);
    }
}

// create checkin datepicker
checkin_div = $('.checkin-picker').datepicker({
    format: "yyyy-mm-dd",
    autoclose: false,

    beforeShowDay: function (date) {
        if (checkout_date !== undefined) {
            // disabled date selection for day after checkout date
            if (date > checkout_date) {
                return false;
            }
            // display checkout date in checkin datepicker
            if (date.getDate() === checkout_date.getDate() &&
                date.getMonth() === checkout_date.getMonth() &&
                date.getFullYear() === checkout_date.getFullYear()) {
                return {
                    classes: 'is-selected'
                };
            }
        }
        // display range dates in checkin datepicker
        if (checkin_date !== undefined && checkout_date !== undefined) {
            if (date > checkin_date && date < checkout_date) {
                return {
                    classes: 'is-between'
                };
            }
        }
        // display checkin date
        if (checkin_date !== undefined) {
            if (date.getDate() === checkin_date.getDate() &&
                date.getMonth() === checkin_date.getMonth() &&
                date.getFullYear() === checkin_date.getFullYear()) {
                return {
                    classes: 'active'
                };
            }
        }
        return true;
    }
});

// save checkin datepicker for later
checkin_dp = checkin_div.data('datepicker');

// update datepickers on checkin date change
checkin_div.on('changeDate', (event) => {
    // save checkin date
    checkin_date = event.date;
    // update checkout datepicker so range dates are displayed
    checkout_dp.update();
    checkin_dp.update();
});

// create checkout datepicker
checkout_div = $('.checkout-picker').datepicker({
    format: "yyyy-mm-dd",
    autoclose: false,
    toValue: function (date, format, language) {
        var d = new Date(date);
        d.setDate(d.getDate() + 7);
        return new Date(d);
    },
    beforeShowDay: function (date) {
        if (checkin_date !== undefined) {
            // disabled date selection for day before checkin date
            if (date < checkin_date) {
                return false;
            }
            // display checkin date in checkout datepicker
            if (date.getDate() === checkin_date.getDate() &&
                date.getMonth() === checkin_date.getMonth() &&
                date.getFullYear() === checkin_date.getFullYear()) {
                return {
                    classes: 'is-selected'
                };
            }
        }
        // display range dates in checkout datepicker
        if (checkin_date !== undefined && checkout_date !== undefined) {
            if (date > checkin_date && date < checkout_date) {
                return {
                    classes: 'is-between'
                };
            }
        }
        // display checkout date
        if (checkout_date !== undefined) {
            if (date.getDate() === checkout_date.getDate() &&
                date.getMonth() === checkout_date.getMonth() &&
                date.getFullYear() === checkout_date.getFullYear()) {
                return {
                    classes: 'active'
                };
            }
        }
        return true;
    }
});

// save checkout datepicker for later
checkout_dp = checkout_div.data('datepicker');

// update datepickers on checkout date change
checkout_div.on('changeDate', (event) => {
    // save checkout date
    checkout_date = event.date;
    // update checkin datepicker so range dates are displayed
    checkin_dp.update();
    checkout_dp.update();
});