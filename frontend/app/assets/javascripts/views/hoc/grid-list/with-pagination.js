import React, { Component } from 'react'
import PropTypes from 'prop-types'

import classNames from 'classnames'

import Pagination from 'views/components/Navigation/Pagination'

import { MenuItem, Select, TextField } from '@material-ui/core'

import UIHelpers from 'common/UIHelpers'
import IntlService from 'views/services/intl'
const intl = IntlService.instance
/**
 * HOC: Adds pagination to a grid list
 */
const { any, bool, func, number } = PropTypes
export default function withPagination(ComposedFilter, pageSize = 10, pageRange = 10) {
  class PaginatedGridList extends Component {
    static propTypes = {
      appendControls: any, // TODO: set appropriate propType
      disablePageSize: bool,
      paginationEventHandler: func.isRequired,
      paginationCurrentPageIndex: number.isRequired,
      paginationPageSize: number.isRequired,
      paginationResultsCount: number.isRequired,
      paginationPageCount: number.isRequired,
    }
    static defaultProps = {
      disablePageSize: false,
      paginationEventHandler: () => {},
      paginationCurrentPageIndex: 0,
      paginationPageSize: 10,
      paginationResultsCount: 0,
      paginationPageCount: 0,
    }

    constructor(props, context) {
      super(props, context)

      this.state = {
        pageRange,
        initialPageSize: props.paginationPageSize || pageSize,
        currentPageSize: props.paginationPageSize || pageSize,
        currentPageIndex: 1,
      }
    }

    _onPageSizeChange = (event) => {
      this._paginationEventHandler({
        currentPageIndex: this.state.currentPageIndex,
        currentPageSize: event.target.value,
      })
    }

    _changePage(currentPageIndex) {
      this._paginationEventHandler({
        currentPageIndex,
        currentPageSize: this.state.currentPageSize,
      })

      // For longer pages, user should be taken to the top when changing pages
      document.body.scrollTop = document.documentElement.scrollTop = 0
    }

    _onPageChange = (pagination) => {
      this._changePage(pagination.selected + 1)
    }

    _paginationEventHandler({ currentPageIndex, currentPageSize }) {
      this.props.paginationEventHandler(
        Object.assign(
          {},
          {
            paginationCurrentPageIndex: this.props.paginationCurrentPageIndex,
            paginationPageSize: this.props.paginationPageSize,
          },
          {
            paginationCurrentPageIndex: currentPageIndex,
            paginationPageSize: currentPageSize,
          }
        )
      )

      this.setState({ currentPageSize })
    }

    _onGoToPage = (event) => {
      let newPageIndex = event.target.value
      const maxPageIndex = Math.ceil(this.props.paginationResultsCount / this.state.currentPageSize)

      if (newPageIndex > maxPageIndex) {
        newPageIndex = maxPageIndex
      }

      this._changePage(newPageIndex)
    }

    render() {
      const pageSizeControl = this.props.disablePageSize ? null : this._getPageSizeControls()

      return (
        <div>
          <div className="row">
            <div className="col-xs-12">
              <ComposedFilter {...this.state} {...this.props} />
            </div>
          </div>

          <div className="row PrintHide" style={{ marginTop: '15px' }}>
            <div className={classNames('col-md-7', 'col-xs-12')} style={{ paddingBottom: '15px' }}>
              <Pagination
                forcePage={this.props.paginationCurrentPageIndex - 1}
                pageCount={this.props.paginationPageCount}
                marginPagesDisplayed={0}
                pageRangeDisplayed={UIHelpers.isViewSize('xs') ? 3 : 10}
                onPageChange={this._onPageChange}
              />
            </div>

            <div className={classNames('col-md-5', 'col-xs-12')} style={{ textAlign: 'right' }}>
              {pageSizeControl}
              {this.props.appendControls}
            </div>

            <div
              className={classNames('col-xs-12')}
              style={{
                textAlign: 'left',
                backgroundColor: '#f1f1f1',
                borderTop: '1px #d8d8d8 solid',
              }}
            >
              Skip to Page:
              <TextField
                style={{ paddingLeft: '5px' }}
                // hintText="Enter #"
                onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    this._onGoToPage(e)
                  }
                }}
              />
            </div>
          </div>
        </div>
      )
    }

    _getPageSizeControls = () => {
      return (
        <div>
          <label style={{ verticalAlign: '4px', marginRight: '8px' }}>Page:</label>
          <span style={{ verticalAlign: '4px' }}>
            {this.props.paginationCurrentPageIndex} /{' '}
            {Math.ceil(this.props.paginationResultsCount / this.state.currentPageSize)}
          </span>
          <label
            style={{
              verticalAlign: '4px',
              marginRight: '8px',
              marginLeft: '8px',
              paddingLeft: '8px',
              borderLeft: '1px solid #e0e0e0',
            }}
          >
            Per Page:
          </label>
          <Select
            style={{ width: '45px', marginRight: '8px' }}
            value={this.state.currentPageSize}
            onChange={this._onPageSizeChange}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={250}>250</MenuItem>
            <MenuItem value={500}>500</MenuItem>
          </Select>
          <label
            style={{
              verticalAlign: '4px',
              marginRight: '8px',
              paddingLeft: '8px',
              borderLeft: '1px solid #e0e0e0',
            }}
          >
            {intl.trans('results', 'Results', 'first')}:
          </label>
          <span style={{ verticalAlign: '4px' }}>{this.props.paginationResultsCount}</span>
        </div>
      )
    }
  }

  return PaginatedGridList
}
