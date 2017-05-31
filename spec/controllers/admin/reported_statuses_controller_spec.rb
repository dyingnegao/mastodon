require 'rails_helper'

describe Admin::ReportedStatusesController do
  render_views

  let(:user) { Fabricate(:user, admin: true) }
  let(:report) { Fabricate(:report, status_ids: [status.id]) }
  let(:status) { Fabricate(:status) }

  before do
    sign_in user, scope: :user
  end

<<<<<<< HEAD
  let(:report) { Fabricate(:report, status_ids: [status.id]) }
  let(:status) { Fabricate(:status) }

=======
>>>>>>> 8963f8c3c2630bfcc377a5ca0513eef5a6b2a4bc
  describe 'PATCH #update' do
    subject do
      -> { patch :update, params: { report_id: report, id: status, status: { sensitive: sensitive } } }
    end

    let(:status) { Fabricate(:status, sensitive: !sensitive) }
<<<<<<< HEAD

    context 'given { sensitive: true }' do
      let(:sensitive) { true }

=======
    let(:sensitive) { true }

    context 'updates sensitive column to true' do
>>>>>>> 8963f8c3c2630bfcc377a5ca0513eef5a6b2a4bc
      it 'updates sensitive column' do
        is_expected.to change {
          status.reload.sensitive
        }.from(false).to(true)
      end
    end

<<<<<<< HEAD
    context 'given { sensitive: false }' do
=======
    context 'updates sensitive column to false' do
>>>>>>> 8963f8c3c2630bfcc377a5ca0513eef5a6b2a4bc
      let(:sensitive) { false }

      it 'updates sensitive column' do
        is_expected.to change {
          status.reload.sensitive
        }.from(true).to(false)
      end
    end
<<<<<<< HEAD
=======

    it 'redirects to report page' do
      subject.call
      expect(response).to redirect_to(admin_report_path(report))
    end
>>>>>>> 8963f8c3c2630bfcc377a5ca0513eef5a6b2a4bc
  end

  describe 'DELETE #destroy' do
    it 'removes a status' do
      allow(RemovalWorker).to receive(:perform_async)

      delete :destroy, params: { report_id: report, id: status }
      expect(response).to redirect_to(admin_report_path(report))
      expect(RemovalWorker).
        to have_received(:perform_async).with(status.id)
    end
  end
end
