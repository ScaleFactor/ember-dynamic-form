import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { inject } from '@ember/service';
export default Component.extend({
  ajax: inject(),

  classNames: [],
  init(){
    this._super(...arguments);
    this.set('completedFields', {});
  },
  didReceiveAttrs(){
    this.initializeResponseObject();
  },
  completedFieldsCount: 0,
  totalFieldsCount: alias('formFields.length'),
  progressBarOffset: computed('totalFieldsCount,completedFieldsCount', function(){
    let totalFieldsCount = this.get('totalFieldsCount');
    if (totalFieldsCount === 0){
      return 0;
    }
    let completedFieldsCount = this.get('completedFieldsCount');
    return Math.trunc((completedFieldsCount / totalFieldsCount) * 100);
  }),
  notifyCompletionState(fieldId, isCompleted){
    next(()=>{
      this.set(`completedFields.${fieldId}`, isCompleted);
      const completedFields = this.get('completedFields');
      const count =  Object.values(completedFields).reduce((acc, val) => {
      if(val === true){
        acc++;
      }
      return acc;
      }, 0);
      this.set('completedFieldsCount', count)
    })

  },
  initializeResponseObject() {
    let existingFormResponse = this.get('formResponse');
    try {
      existingFormResponse = JSON.parse(existingFormResponse);
    } catch(err) {
      console.error(err);
    }

    this.set('formResponse', this.get('formFields').reduce((acc, f) => {
      acc[f.id] = existingFormResponse[f.id] || {};
      return acc;
    }, {}));
  },

  actions: {
    save() {
      this.get('ajax')
        .patch(this.get('patchUrl'), { data: { form_response: JSON.stringify(this.get('formResponse')) } })
        .then(() => {
          this.send('successAction');
        })
        .catch(e => {
          console.error(e);
          this.send('errorAction');
        });
    },
  },
});
