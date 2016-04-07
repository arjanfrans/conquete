'use strict';

module.exports = {
    OptionsValidationError: {
        name: 'OptionsValidationError',
        message: data => `Validation for "options" failed. The following errors occurred: \n${data.errors.map(error => '  - ' + error).join('\n')}`
    }
};
