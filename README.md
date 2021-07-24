## Description
TsSelect2 is a version of <a href="https://github.com/select2/select2" target="_blank">Select2</a> written in typescript without any dependencies. It supports searching, remote data sets, and infinite scrolling of results.
Use the TsSelect2 library for development only, not production for now.

## Installation - NPM

```sh
npm i ts-select2
```

## Installation - Browser


```html
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/css/select2.min.css" rel="stylesheet" />
<script src="https://unpkg.com/ts-select2@0.1.0/dist/ts-select2.min.js"></script>
```

## Usage

Add the following libraries to the page:
* ts-select2.min.js

Add the following stylesheets from <a href="https://github.com/select2/select2" target="_blank">Select2</a> to the page:
* select2.min.css

## Initialisation

```html
<select data-placeholder="Select something" multiple="multiple" class="form-control select-access-multiple-enable">
    <option value="AK">Alaska</option>
    <option value="CA">California</option>
    <option value="AZ" selected>Arizona</option>
    <option value="CO">Colorado</option>
    <option value="ID">Idaho</option>
    <option value="WY" selected>Wyoming</option>
    <option value="CT">Connecticut</option>
</select>
```

## [Example](https://ivkan.github.io/ts-select2/example.html)

To initialise the select, call TsSelect2 on the element:
```javascript
const select2 = new TsSelect2(select, {  minimumResultsForSearch: Infinity,  width: `250px` });
```
