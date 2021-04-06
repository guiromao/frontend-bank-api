var customerData;

var tableCustomers = $('#table_customers');
var firstnameInput = $('#input_firstname');
var lastnameInput = $('#input_lastname');
var emailInput = $('#input_email');
var phoneInput = $('#input_phone');
var idValue = $('#id_value');

var msgFirstname = $('#validate_firstname');
var msgLastname = $('#validate_lastname');
var msgEmail = $('#validate_email');
var msgPhone = $('#validate_phone');

var buttonAdd = $('#button_add');
var buttonUpdate = $('#button_update');
var buttonReset = $('#button_reset');

var successP = $('#p_success');
var redP = $('#p_red');

$(buttonAdd).click(function (event) {
    hideUpdates();
    addCustomer();
});

$(buttonUpdate).click(function (event) {
    hideUpdates();
    confirmEdit();
});

$(buttonReset).click(function (event) {
    hideUpdates();
    eraseFields();
});

var loadData = function () {
    $.ajax({
        url: "http://localhost:8080/javabank4/customer/",
        type: 'GET',
        dataType: 'json',
        success: function (dataResponse) {
            console.log(dataResponse);
            customerData = dataResponse;
            populateTable();
        }
    });
};

var populateTable = function () {
    customerData.forEach(function (customer) {

        var element = "<tr><td>" + customer.firstName + "</td>" +
            "<td>" + customer.lastName + "</td>" +
            "<td>" + customer.email + "</td>" +
            "<td>" + customer.phone + "</td>" +
            "<td><button class=\"btn btn-primary\" onclick=\"editUser(" + customer.id + ")\"> Edit </button></td>" +
            "<td><button class=\"btn btn-danger\" onClick=\"deleteCustomer(" + customer.id + ")\"> Delete </button></td></tr>";

        $(element).appendTo(tableCustomers);

        console.log(customer);
    });
}

var deleteTable = function () {

    $("#table_customers tr").remove();

    var header = "<tr>" +
        "<th><b>First Name</b></th>" +
        "<th><b>Last Name<b></b></th>" +
        "<th><b>E-Mail</b></th>" +
        "<th><b>Phone</b></th>" +
        "<th><b>Edit</b></th>" +
        "<th><b>Delete</b></th>" +
        "</tr>";

    $(header).appendTo(tableCustomers);
}

var refreshTable = function () {
    deleteTable();
    loadData();
}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

var validateAllFields = function () {

    hideUpdates();

    var correctFields = 0;

    if ($(firstnameInput).val().length >= 3) {
        $(msgFirstname).attr("hidden", true);
        correctFields++;
    }
    else {
        $(msgFirstname).removeAttr('hidden');
    }

    if ($(lastnameInput).val().length >= 3) {
        $(msgLastname).attr("hidden", true);
        correctFields++;
    }
    else {
        $(msgLastname).removeAttr('hidden');
    }

    if (isEmail($(emailInput).val())) {
        $(msgEmail).attr("hidden", true);
        correctFields++;
    }
    else {
        $(msgEmail).removeAttr('hidden');
    }

    if ($(phoneInput).val().length >= 9 && $.isNumeric($(phoneInput).val())) {
        $(msgPhone).attr("hidden", true);
        correctFields++;
    }
    else {
        $(msgPhone).removeAttr('hidden');
    }

    return (correctFields == 4);
}

var addCustomer = function () {

    var customer = {
        firstName: $(firstnameInput).val(),
        lastName: $(lastnameInput).val(),
        email: $(emailInput).val(),
        phone: $(phoneInput).val()
    };

    if (validateAllFields() && $(idValue).val() == 0) {

        $.ajax({
            url: 'http://localhost:8080/javabank4/customer/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                firstName: $(firstnameInput).val(),
                lastName: $(lastnameInput).val(),
                email: $(emailInput).val(),
                phone: $(phoneInput).val()
            }),
            success: function (result) {
                refreshTable();
                eraseFields();
                updateSuccessMessage(customer, "added");
            },
            error: function (response) {
                alert(response);
            }
        });

    }
}

var editUser = function (id) {

    console.log("Entering change user");
    var customer = fecthUser(id);

    hideUpdates();

    if (customer !== null) {
        console.log("Going to write user\'s name: " + customer.firstName);
        $(firstnameInput).val(customer.firstName);
        $(lastnameInput).val(customer.lastName);
        $(emailInput).val(customer.email);
        $(phoneInput).val(customer.phone);
        $(idValue).val(customer.id);
    }
}

var confirmEdit = function () {

    if ($(idValue).val() != 0) {
        if (validateAllFields()) {
            var id = $(idValue).val();

            var customer = {
                firstName: $(firstnameInput).val(),
                lastName: $(lastnameInput).val(),
                email: $(emailInput).val(),
                phone: $(phoneInput).val()
            };

            $.ajax({
                url: 'http://localhost:8080/javabank4/customer/' + id,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    firstName: $(firstnameInput).val(),
                    lastName: $(lastnameInput).val(),
                    email: $(emailInput).val(),
                    phone: $(phoneInput).val()
                }),
                success: function (result) {
                    refreshTable();
                    eraseFields();
                    updateSuccessMessage(customer, "updated");
                },
                error: function (response) {
                    alert(response);
                }
            });
        }
    }
    else {
        alert("Error: trying to update an unexisting customer.");
    }
}

var fecthUser = function (id) {
    for (var i = 0; i != customerData.length; i++) {
        if (customerData[i].id == id) {
            return customerData[i];
        }
    }

    return null;
}

function deleteCustomer(id) {

    var customer = fecthUser(id);

    $.ajax({
        url: 'http://localhost:8080/javabank4/customer/' + id,
        type: 'DELETE',
        contentType: 'application/json',
        dataType: 'text',
        success: function (result) {
            refreshTable();
            updateRedMessage(customer);
        },
        error: function (result) { }
    });
}

var updateSuccessMessage = function (customer, action) {
    hideUpdates();
    $(successP).text("Customer " + customer.firstName + " " + customer.lastName + " " + action + "!");
    $(successP).removeAttr("hidden");
}

var updateRedMessage = function (customer) {
    hideUpdates();
    $(redP).text("Customer " + customer.firstName + " " + customer.lastName + " deleted.");
    $(redP).removeAttr("hidden");
}

var hideUpdates = function () {
    $(redP).attr("hidden", true);
    $(successP).attr("hidden", true);
}

var eraseFields = function () {
    $(firstnameInput).val("");
    $(lastnameInput).val("");
    $(emailInput).val("");
    $(phoneInput).val("");
    $(idValue).val(0);
}

loadData();
