import React from 'react';
import { queries as templatesQuery } from 'modules/settings/emailTemplates/graphql';
import { IRouterProps } from '../../common/types';
import Booking from '../components/Booking';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations } from '../graphql';
import { AddBookingMutationResponse, IBooking } from '../types';
import { Alert } from 'modules/common/utils';
import { withRouter } from 'react-router';
import {
  EmailTemplatesQueryResponse,
  EmailTemplatesTotalCountQueryResponse
} from 'modules/settings/emailTemplates/containers/List';

type Props = {
  history: any;
};

type FinalProps = {
  emailTemplatesQuery: EmailTemplatesQueryResponse;
  emailTemplatesTotalCountQuery: EmailTemplatesTotalCountQueryResponse;
} & Props &
  IRouterProps &
  AddBookingMutationResponse;

type State = {
  loading: boolean;
  isReadyToSaveForm: boolean;
  doc?: IBooking;
};

class CreateBookingContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      loading: false,
      isReadyToSaveForm: false
    };
  }

  render() {
    const { addBookingMutation, history, emailTemplatesQuery } = this.props;

    const afterFormDbSave = id => {
      this.setState({ isReadyToSaveForm: false });

      if (this.state.doc) {
        addBookingMutation({
          variables: {
            ...this.state.doc,
            formId: id
          }
        })
          .then(() => {
            Alert.success('You successfully added a booking');
            history.push('/bookings');
          })

          .catch(error => {
            Alert.error(error.message);
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      }
    };

    const save = doc => {
      this.setState({ loading: false, isReadyToSaveForm: true, doc });
    };

    const updatedProps = {
      ...this.props,
      isActionLoading: this.state.loading,
      save,
      afterFormDbSave,
      isReadyToSaveForm: this.state.isReadyToSaveForm,
      emailTemplates: emailTemplatesQuery.emailTemplates || []
    };
    return <Booking {...updatedProps} />;
  }
}

export default compose(
  graphql<{}, AddBookingMutationResponse>(gql(mutations.bookingsAdd), {
    name: 'addBookingMutation'
  }),
  graphql(gql(templatesQuery.totalCount), {
    name: 'emailTemplatesTotalCountQuery'
  }),
  graphql<FinalProps, EmailTemplatesQueryResponse>(
    gql(templatesQuery.emailTemplates),
    {
      name: 'emailTemplatesQuery',
      options: ({ emailTemplatesTotalCountQuery }) => ({
        variables: {
          perPage: emailTemplatesTotalCountQuery.emailTemplatesTotalCount
        }
      })
    }
  )
)(withRouter<FinalProps>(CreateBookingContainer));