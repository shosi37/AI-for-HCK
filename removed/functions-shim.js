// NOTE: The functions have been archived to `backend/functions-legacy/` per project cleanup.
// Original file kept as a small shim to avoid breaking scripts that reference `functions/`.
exports.noAdmin = (req, res) => {
  res.status(200).send('Functions moved to backend/functions-legacy — see that folder for archived code')
}