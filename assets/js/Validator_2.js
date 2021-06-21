function Validator(formName) {
	const formElement = document.querySelector(formName)

	const formRules = {}
	const validatorRules = {
		required: function(value) {
			return value ? undefined : "Vui lòng nhập trường này"
		},

		email: function(value) {
			const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
			return regex.test(value) ? undefined : "Trường này phải là email"
		},

		min: function(min) {
			return function(value) {
				return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
			}
		},

		confirmation: function(confirm) {
			let valueConfirm = confirm

			if(confirm.includes('#')) {
				const confirmElement = formElement.querySelector(confirm)
				confirmElement.onchange = () => {
					valueConfirm = confirmElement.value
				}
			}
			return function(value) {
				return value === valueConfirm ? undefined : "Giá trị nhập vào không khớp"
			}
		},
		
	}

	if(formElement) {
		const inputElements = formElement.querySelectorAll('[name][rules]')
		if(inputElements.length > 0) {
			for(input of inputElements) {
				const rules = input.getAttribute('rules').split('|')
				for(rule of rules) {
					const isRuleHasValue = rule.includes(':')
					let ruleInfo = []

					if(isRuleHasValue) {
						ruleInfo = rule.split(':')
						rule = ruleInfo[0]
					}

					let funcRule = validatorRules[rule]
					if(isRuleHasValue) {
						funcRule = validatorRules[rule](ruleInfo[1])
					}

					if(Array.isArray(formRules[input.name]))
						formRules[input.name].push(funcRule)
					else
						formRules[input.name] = [funcRule]
				}

				input.onblur = handleValidate
				input.oninput = handleRemoveMessageError
			}

			function handleValidate(e) {
				const rules = formRules[e.target.name]
				let errorMessage = undefined

				for(rule of rules) {
					switch(e.target.type) {
						case 'radio':
						case 'checkbox':
							if(e.target.checked === true)
								errorMessage = rule(e.target)
							break
						default:
							errorMessage = rule(e.target.value)
					}
					// errorMessage = rule(e.target.value)

					if(errorMessage) break
				}

				const parentElement = getParent(e.target, '.form-section__form-group')
				const messageElement = parentElement.querySelector('.form-section__form-message')

				messageElement.innerText = errorMessage || ''
				parentElement.classList.toggle('error', !!errorMessage)

				return !errorMessage
			}

			function handleRemoveMessageError(e) {
				const parentElement = getParent(e.target, '.form-section__form-group')
				const messageElement = parentElement.querySelector('.form-section__form-message')

				messageElement.innerText = ''
				parentElement.classList.remove('error')
			}

			function getParent(element, selector) {
				do {
					if(element.parentElement.matches(selector)) {
						return element.parentElement
					}

					element = element.parentElement
				} while (element.parentElement)
			}

			formElement.onsubmit = (e) => {
				e.preventDefault()
				let isFormValid = true
				let isValid = true
				let data = {}

				for(input of inputElements) {
					isValid = handleValidate({
						target: input
					})
					if(!isValid) isFormValid = false

					switch(input.type) {
						case 'radio':
							if(input.matches(':checked'))
								data[input.name] =
									formElement.querySelector('input[name="' + input.name + '"]:checked').value
							break

						case 'checkbox':
							if(input.matches(':checked')) {
								if(!Array.isArray(data[input.name]))
									data[input.name] = []

								data[input.name].push(input.value)
							}
							break

						case 'file':
							data[input.name] = input.files
							break

						default:
							data[input.name] = input.value.trim()
					}
				}

				if(isFormValid) {
					if(typeof this.onSubmit === 'function')
						this.onSubmit(data)
					else
						formElement.submit()
				}
			}
		}
		else {
			console.error('Error: Cannot find Element in ' + formName)
		}
	}
	else {
		console.error('Error: Cannot find form by ' + formName)
	}
}