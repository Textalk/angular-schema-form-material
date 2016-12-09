import angular from 'angular';

import {
  schemaDefaults,
  merge,
  traverseSchema,
  traverseForm,
} from 'json-schema-form-core';

/**
 * Schema form service.
 */
export default function() {
  let postProcessFn = (form) => form;
  const defaults = schemaDefaults.createDefaults();

  /**
   * Provider API
   */
  this.defaults              = defaults;
  this.stdFormObj            = schemaDefaults.stdFormObj;
  this.defaultFormDefinition = schemaDefaults.defaultFormDefinition;

  /**
   * Register a post process function.
   * This function is called with the fully merged
   * form definition (i.e. after merging with schema)
   * and whatever it returns is used as form.
   */
  this.postProcess = function(fn) {
    postProcessFn = fn;
  };

  /**
   * Append default form rule
   *
   * @param {string}   type json schema type
   * @param {Function} rule a function(propertyName,propertySchema,options) that returns a form
   *                        definition or undefined
   */
  this.appendRule = function(type, rule) {
    if (!defaults[type]) {
      defaults[type] = [];
    }
    defaults[type].push(rule);
  };

  /**
   * Prepend default form rule
   *
   * @param {string}   type json schema type
   * @param {Function} rule a function(propertyName,propertySchema,options) that returns a form
   *                        definition or undefined
   */
  this.prependRule = function(type, rule) {
    if (!defaults[type]) {
      defaults[type] = [];
    }
    defaults[type].unshift(rule);
  };

  /**
   * Utility function to create a standard form object.
   * This does *not* set the type of the form but rather all shared attributes.
   * You probably want to start your rule with creating the form with this method
   * then setting type and any other values you need.
   * @param {Object} schema
   * @param {Object} options
   * @return {Object} a form field defintion
   */
  this.createStandardForm = schemaDefaults.stdFormObj;
  /* End Provider API */

  this.$get = function() {

    var service = {};
    var typeDefault = this.defaults;

    service.merge = function(schema, form, ignore, options, readonly, asyncTemplates) {
      form  = form || [ '*' ];
      options = options || {};

      // Get readonly from root object
      readonly = readonly || schema.readonly || schema.readOnly;

      const stdForm = schemaDefaults.defaultForm(schema, typeDefault, ignore, options);

      //simple case, we have a "*", just put the stdForm there
      var idx = form.indexOf('*');
      if (idx !== -1) {
        form  = form.slice(0, idx)
                   .concat(stdForm.form)
                   .concat(form.slice(idx + 1));
      }

      //ok let's merge!
      //We look at the supplied form and extend it with schema standards
      const canonical = merge(stdForm.lookup, form, options, readonly, asyncTemplates);
      return postProcessFn(canonical);
    };

    /**
     * Create form defaults from schema
     */
    service.defaults = schemaDefaults.defaultForm;

    //Utility functions
    /**
     * Form defaults for schema by type
     * As a form is generated from a schema these are the definitions of each json-schema type
     */
    service.typeDefault = typeDefault;

    /**
     * Traverse a schema, applying a function(schema,path) on every sub schema
     * i.e. every property of an object.
     */
    service.traverseSchema = traverseSchema;

    service.traverseForm = traverseForm;

    return service;
  };
}
