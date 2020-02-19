export const deleteIssue = () => {
  const issue = window.location.href.substring(
    window.location.href.lastIndexOf('/') + 1
  );
  const result = window.confirm(
    `Are you sure you wish to delete issue ${issue}? This cannot be undone.`
  );
  if (result) {
    fetch(`/editions-api/issues/${issue}`, {
      credentials: 'include',
      method: 'DELETE'
    });
    return 'Deleted';
  } else {
    return 'Cancelled';
  }
};
