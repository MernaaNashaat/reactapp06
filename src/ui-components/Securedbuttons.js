 import { Auth } from 'aws-amplify';

const SecuredButtons = () => {
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const groups = user.signInUserSession.accessToken.payload['cognito:groups'] || [];
      setUserGroups(groups);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  return (
    <div>
      {userGroups.includes('Owner') && (
        <button className="owner-btn">
          View SCADA Reports
        </button>
      )}

      {userGroups.includes('Operator') && (
        <button className="operator-btn">
          Send Cement Batch Details
        </button>
      )}
    </div>
  );
};