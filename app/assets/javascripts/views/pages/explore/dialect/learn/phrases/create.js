/*
Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, {Component, PropTypes} from 'react';
import Immutable, { List, Map } from 'immutable';
import classNames from 'classnames';
import provide from 'react-redux-provide';
import selectn from 'selectn';
import t from 'tcomb-form';

import ProviderHelpers from 'common/ProviderHelpers';
import PromiseWrapper from 'views/components/Document/PromiseWrapper';

// Views
import RaisedButton from 'material-ui/lib/raised-button';

import fields from 'models/schemas/fields';
import options from 'models/schemas/options';

/**
* Create phrase entry
*/
@provide
export default class PageDialectPhrasesCreate extends Component {

  static propTypes = {
    windowPath: PropTypes.string.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    fetchDialect2: PropTypes.func.isRequired,
    computeDialect2: PropTypes.object.isRequired,
    createPhrase: PropTypes.func.isRequired,
    computePhrase: PropTypes.object.isRequired,
    routeParams: PropTypes.object.isRequired,
    onDocumentCreated: PropTypes.func
  };

  constructor(props, context){
    super(props, context);

    this.state = {
      formValue: null,
      dialectPath: null,
      phrasePath: null
    };

    // Bind methods to 'this'
    ['_onRequestSaveForm'].forEach( (method => this[method] = this[method].bind(this)) );
  }

  fetchData(newProps) {
    if (!selectn('response', ProviderHelpers.getEntry(newProps.computeDialect2, newProps.routeParams.dialect_path)))
      newProps.fetchDialect2(newProps.routeParams.dialect_path);
  }

  // Fetch data on initial render
  componentDidMount() {	  
    this.fetchData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    
    if(this.props.onDocumentCreated && this.state.phrasePath && selectn("success", ProviderHelpers.getEntry(nextProps.computePhrase, this.state.phrasePath))) {
    	this.props.onDocumentCreated(ProviderHelpers.getEntry(nextProps.computePhrase, this.state.phrasePath).response);
    }    	
  }

  shouldComponentUpdate(newProps, newState) {

    switch (true) {
      case (newProps.windowPath != this.props.windowPath):
        return true;
      break;

      case (newProps.computeDialect2 != this.props.computeDialect2):
        return true;
      break;
      
      case (newProps.computePhrase != this.props.computePhrase):
        return true;
      break;
    }

    return false;
  }

  _onRequestSaveForm(e) {

    // Prevent default behaviour
    e.preventDefault();

    let formValue = this.refs["form_phrase_create"].getValue();

    //let properties = '';
    let properties = {};
    
	  for (let key in formValue) {
	    if (formValue.hasOwnProperty(key) && key) {
	      if (formValue[key] && formValue[key] != '') {
	        //properties += key + '=' + ((formValue[key] instanceof Array) ? JSON.stringify(formValue[key]) : formValue[key]) + '\n';
	    	  properties[key] = formValue[key];
	  	  }
	    }
	  }

    this.setState({
      formValue: properties
    })

    // Passed validation
    if (formValue) {
      let now = Date.now();
  	  this.props.createPhrase(this.props.routeParams.dialect_path + '/Dictionary', {
  	    type: 'FVPhrase',
  	    name: formValue['dc:title'],
  	    properties: properties
  	  }, null, now);

      this.setState({
        phrasePath: this.props.routeParams.dialect_path + '/Dictionary/' + formValue['dc:title'] + '.' + now
      });
    }

  }

  render() {

    const computeEntities = Immutable.fromJS([{
      'id': this.state.phrasePath,
      'entity': this.props.computePhrase
    }, {
      'id': this.props.routeParams.dialect_path,
      'entity': this.props.computeDialect2
    }])

    const computePhrase = ProviderHelpers.getEntry(this.props.computePhrase, this.state.phrasePath);
    const computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path);

    return <PromiseWrapper renderOnError={true} computeEntities={computeEntities}>

            <h1>Add New Phrase to <i>{selectn('response.title', computeDialect2)}</i></h1>
 
            <div className="row" style={{marginTop: '15px'}}>

              <div className={classNames('col-xs-8', 'col-md-10')}>
                <form onSubmit={this._onRequestSaveForm}>
                  <t.form.Form
                    ref="form_phrase_create"
                    type={t.struct(selectn("FVPhrase", fields))}
                    context={selectn('response', computeDialect2)}
                    value={this.state.formValue}
                    options={selectn("FVPhrase", options)} />
                    <div className="form-group">
                      <button type="submit" className="btn btn-primary">Save</button> 
                    </div>
                </form>
              </div>

          </div>
        </PromiseWrapper>;
  }
}