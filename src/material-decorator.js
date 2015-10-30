angular.module('schemaForm')
  .config([ 'schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfBuilderProvider', 'sfPathProvider', '$injector',
    function(schemaFormProvider, decoratorsProvider, sfBuilderProvider, sfPathProvider, $injector) {
      var base = 'decorators/material/';

      var simpleTransclusion = sfBuilderProvider.builders.simpleTransclusion;
      var ngModelOptions     = sfBuilderProvider.builders.ngModelOptions;
      var ngModel            = sfBuilderProvider.builders.ngModel;
      var sfField            = sfBuilderProvider.builders.sfField;
      var condition          = sfBuilderProvider.builders.condition;
      var array              = sfBuilderProvider.builders.array;

      var sfMessagesNode = (function() {
        var html = '<div ng-if="ngModel.$invalid" ng-messages="ngModel.$error"><div sf-message ng-message></div></div>';
        var div = document.createElement('div');
        div.innerHTML = html;
        return div.firstChild;
      })();
      var sfMessages = function(args) {
        var messagesDiv = args.fieldFrag.querySelector('[sf-messages]');
        if (messagesDiv && sfMessagesNode) {
          messagesDiv.appendChild(sfMessagesNode);
        }
      };

      var sfAutocomplete = function(args) {
        var mdAutocomplete = args.fieldFrag.querySelector('[sf-autocomplete]');
        if (mdAutocomplete) {
          if (args.form.onChange) {
            mdAutocomplete.setAttribute('md-selected-item-change', 'args.form.onChange(searchText)');
          };
          if (args.form.onChange) {
            mdAutocomplete.setAttribute('md-search-text-change', 'args.form.onChange(searchText)');
          };
          // mdAutocomplete.setAttribute('md-items', 'item in $filter(''autocomplete'')(searchText);');
          var minLength = args.form.minLength || 1;
          var maxLength = args.form.maxLength || false;
          mdAutocomplete.setAttribute('md-min-length', minLength);
          if (maxLength) {
            mdAutocomplete.setAttribute('md-max-length', maxLength);
          };
        }
      };

      var mdDatepicker = function(args) {
        var mdDatepicker = args.fieldFrag.querySelector('md-datepicker');
        if (mdDatepicker) {
          if (args.form.onChange) {
            mdDatepicker.setAttribute('ng-change', 'args.form.onChange(searchText)');
          };
          // mdDatepicker.setAttribute('md-items', 'item in $filter(''autocomplete'')(searchText);');
          var minDate = args.form.minimum || false;
          var maxDate = args.form.maximum || false;
          if (minDate) {
            mdDatepicker.setAttribute('md-max-date', minDate);
          };
          if (maxDate) {
            mdDatepicker.setAttribute('md-max-date', maxDate);
          };
        }
      };

      var tabs = function(args) {
        if (args.form.tabs && args.form.tabs.length > 0) {
          var tabContainer = args.fieldFrag.querySelector('md-tabs');

          args.form.tabs.forEach(function(tab, index) {
            var mdTab = document.createElement('md-tab');
            mdTab.setAttribute('label', '{{' + args.path + '.tabs[' + index + '].title}}');
            var mdTabBody = document.createElement('md-tab-body');
            var childFrag = args.build(tab.items, args.path + '.tabs[' + index + '].items', args.state);
            mdTabBody.appendChild(childFrag);
            mdTab.appendChild(mdTabBody);
            tabContainer.appendChild(mdTab);
          });
        }
      };

      var defaults = [ sfField, ngModel, ngModelOptions, sfMessages, condition ];

      decoratorsProvider.defineDecorator('materialDecorator', {
        actions: { template: base + 'actions.html', builder: [ sfField, simpleTransclusion, condition ] },
        array: { template: base + 'array.html', builder: [ sfField, ngModelOptions, ngModel, array, condition ] },
        autocomplete: {
          template: base + 'autocomplete.html',
          builder: [ sfField, ngModel, ngModelOptions, sfMessages, condition, sfAutocomplete ]
        },
        boolean: { template: base + 'checkbox.html', builder: defaults },
        button: { template: base + 'submit.html', builder: defaults },
        checkbox: { template: base + 'checkbox.html', builder: defaults },
        checkboxes: {
          template: base + 'checkboxes.html',
          builder: [ sfField, ngModelOptions, ngModel, array, condition ]
        },
        date: { template: base + 'date.html', builder: [ sfField, ngModel, ngModelOptions, sfMessages, mdDatepicker, condition ] },
        'default': { template: base + 'default.html', builder: defaults },
        fieldset: { template: base + 'fieldset.html', builder: [ sfField, simpleTransclusion, condition ] },
        help: { template: base + 'help.html', builder: defaults },
        number: { template: base + 'default.html', builder: defaults },
        password: { template: base + 'default.html', builder: defaults },
        radios: { template: base + 'radios.html', builder: defaults },
        'radios-inline': { template: base + 'radios-inline.html', builder: defaults },
        radiobuttons: { template: base + 'radio-buttons.html', builder: defaults },
        section: { template: base + 'section.html', builder: [ sfField, simpleTransclusion, condition ] },
        select: { template: base + 'select.html', builder: defaults },
        submit: { template: base + 'submit.html', builder: defaults },
        tabs: { template: base + 'tabs.html', builder: [ sfField, tabs, condition ] },
        tabarray: { template: base + 'tabarray.html', builder: [ sfField, ngModelOptions, ngModel, array, condition ] },
        textarea: { template: base + 'textarea.html', builder: defaults },
        switch: { template: base +  'switch.html', builder: defaults}
      });

      /**
       * Material Datepicker
       */
      var date = function(name, schema, options) {
        if (schema.type === 'string' && (schema.format === 'date' || schema.format === 'date-time')) {
          var f = schemaFormProvider.stdFormObj(name, schema, options);
          f.key  = options.path;
          f.type = 'date';
          options.lookup[sfPathProvider.stringify(options.path)] = f;
          return f;
        }
      };
      schemaFormProvider.defaults.string.unshift(date);
    }
  ]);
/*
  TODO add default filter for autocomplete which allows form.optionFilter or 'autocompleteFilter' to override
  Something along the following lines...
  if ($injector.has('autocompleteFilter')) {
    result = $filter('autocomplete')(input);
  }
  else
  if ($injector.has(args.form.optionFilter + 'Filter')) {
    result = $filter(args.form.optionFilter)(input);
  }
  else {
    if (args.form.optionFilter) {
      mdDatepicker.setAttribute('md-items',
        'item in evalExpr("this[\""+form.optionFilter+"\"](\""+searchText+"\")")');
    }
  }

  .filter('autocompleteMovieTest', function() {
    function autocompleteMovieTestFilter(array, input){
      var current = input;
      // You could also call multiple filters here using:
      // current = $filter('filterName')(input)
      if(typeof current === 'string') {
        current = current.replace(' ','-').toLowerCase();
      }
      current = (!current) ? '_undefined' : current;
      return current;
    }

    return externalOptionUriFilter;
  })
*/
