export function validateCAP(value) {
    return (!value || value?.trim().match(/^\d{5}$/)) ? true : 'Il CAP deve essere composto da 5 cifre';
}

export function validatePrefisso(value) {
    return (!value || value?.trim().match(/^\d{2,4}$/)) ? true : 'Il prefisso telefonico deve essere composto da 2-4 cifre';
}

export function validateLatitudine(value) {
    return (!value || value?.trim().match(/^-?([0-8]?[0-9]|90)(\.[0-9]{1,10})?$/)) ? true : 'La latitudine deve essere un numero valido';
}

export function validateLongitudine(value) {
    return (!value || value?.match(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})?$/)) ? true : 'La longitudine deve essere un numero valido';
}

export function validateEmail(value) {
    return (!value || value?.trim().match(/^.+@.+\..+$/)) ? true : 'Inserisci un indirizzo email valido';
}

export function validatePEC(value) {
    return (!value || value?.trim().match(/^.+@.+\..+$/)) ? true : 'Inserisci un indirizzo PEC valido';
}

export function validateTelefono(value) {
    return (!value || value?.trim().match(/^\d{5,15}$/)) ? true : 'Il telefono deve essere composto da 5-15 cifre';
}

export function validateFax(value) {
    return (!value || value?.trim().match(/^\d{5,15}$/)) ? true : 'Il fax deve essere composto da 5-15 cifre';
}

export function validateCodiceISTAT(value) {
    return (!value || value?.trim().match(/^\d{6}$/)) ? true : 'Il codice ISTAT deve essere composto da 6 cifre';
}