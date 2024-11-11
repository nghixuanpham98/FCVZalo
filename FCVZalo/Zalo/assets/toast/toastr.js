try {
    toastr.options.showMethod = "slideDown";
    toastr.options.hideMethod = "slideUp";
    toastr.options.closeMethod = "slideUp";
    //toastr.options.progressBar = true;
    //toastr.options.rtl = true;
    toastr.options.positionClass = "toast-top-center";
    //toastr.options.positionClass = "toast-bottom-right";
} catch (e) {
    console.log(e);
}
function AlertError(message) {
    try {
        toastr.error("", message, { timeOut: 3000 });
    } catch (e) {
        console.log(e);
        alert(message);
    }
}
function AlertSuccess(message) {
    try {
        toastr.success("", message, { timeOut: 3000 });
    } catch (e) {
        console.log(e);
        alert(message);
    }
}
function AlertWarning(message) {
    try {
        toastr.warning("", message, { timeOut: 3000 });
    } catch (e) {
        console.log(e);
        alert(message);
    }
}