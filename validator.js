function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};

  function Validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    var errorMessage;

    var rules = selectorRules[rule.selector];
    console.log(rules);
    for (var i = 0; i < rules.length; ++i) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;

      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";

      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }
    return !errorMessage;
  }

  var formElement = document.querySelector(options.form);
  console.log(options);

  if (formElement) {
    formElement.onsubmit = (e) => {
      e.preventDefault();

      var isFormValid = true;

      options.rules.forEach((rule) => {
        var inputElement = formElement.querySelector(rule.selector);

        var isValid = Validate(inputElement, rule);

        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");

          var formValues = Array.from(enableInputs).reduce((values, input) => {
            values[input.name] = input.value;
            return values;
          }, {});

          options.onSubmit({ formValues });
        } else {
          formElement.submit();
        }
      }
    };

    options.rules.forEach((rule) => {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.handler);
      } else {
        selectorRules[rule.selector] = [rule.handler];
      }

      var inputElement = formElement.querySelector(rule.selector);

      if (inputElement) {
        inputElement.onblur = () => {
          Validate(inputElement, rule);
        };
        inputElement.oninput = () => {
          var errorElement = getParent(
            inputElement,
            options.formGroupSelector
          ).querySelector(options.errorSelector);
          errorElement.innerText = "";

          getParent(inputElement, options.formGroupSelector).classList.remove(
            "invalid"
          );
        };
      }
    });
  }
}

Validator.isRequired = function (selector, message) {
  return {
    selector: selector,

    handler: function (value) {
      return value.trim() ? undefined : message || "Please enter this field";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,

    handler: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      return regex.test(value)
        ? undefined
        : message || "This field must be email";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,

    handler: function (value) {
      return value.length >= min
        ? undefined
        : message || `this field must enter at least ${min} characters`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,

    handler: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Input value is incorrect";
    },
  };
};
