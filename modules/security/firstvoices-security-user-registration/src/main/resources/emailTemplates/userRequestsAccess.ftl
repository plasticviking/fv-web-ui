<html>
<body>

<p>A user is requesting access to a site you administer</p>

<dl>
    <dt>Dialect</dt>
    <dd>${dialectName}</dd>
    <dt>Email</dt>
    <dd>${username}</dd>
    <dt>Interest Reason</dt>
    <dd>${interestReason}</dd>
    <dt>Comment</dt>
    <dd>${comment}</dd>
    <dt>Language Team Member</dt>
    <dd>${languageTeam?string("Yes", "No")}</dd>
    <dt>Community Member</dt>
    <dd>${communityMember?string("Yes", "No")}</dd>
</dl>

<p>Regards,<br />
    The FirstVoices Team</p>
</body>
</html>
