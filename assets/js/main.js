

document.addEventListener('DOMContentLoaded', () => {
	const form = new Validator('#form-register')
	form.onSubmit = function(formData) {
		console.log(formData)
	}
})