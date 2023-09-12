import { useEffect, useRef, useState } from 'react';
import NavBarButton from '../buttons/NavBarButton';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { getCookieValue } from 'hooks/getCookie';
import { IUser, deleteUser, login, setUser } from 'store/userSlice';

const NavHeader = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const dispatch = useDispatch();
  const { isLogin, memberId } = useSelector((state: IUser) => state.user);
  console.log('로그인: ', isLogin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const NavItem = [
    { text: '홈', link: '/' },
    { text: '예약하기', link: '/reservation' },
    { text: '예약현황', link: `/cares/${memberId}` },
    { text: '이용후기', link: '/reviews' },
  ];

  const handleOutsideClick = (e: MouseEvent) => {
    if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      window.addEventListener('click', handleOutsideClick);
    }

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isModalOpen]);

  useEffect(() => {
    const accessToken = getCookieValue('access_token');
    const refreshToken = getCookieValue('refresh_token');

    if (accessToken) {
      axios
        .get(`${apiUrl}/members/my-page`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then((res) => {
          dispatch(login());
          dispatch(setUser(res.data));
        })
        .catch((error) => {
          console.log(error);
          dispatch(deleteUser());
          // access token 재발급
          if (error.response.data.status === 401) {
            const refreshToken = getCookieValue('refresh_token');
            axios
              .post(`${apiUrl}/refreshToken`, { headers: { Authorization: `Bearer ${refreshToken}` } })
              .then((res) => {
                console.log(res);
                if (res.data.access_token) {
                  document.cookie = `access_token=${res.data.accessToken}; path=/;`;
                }
              })
              .catch((error) => console.log(error));
          }
        });
    } else if (!accessToken || !refreshToken) {
      dispatch(deleteUser());
    }
  }, [isLogin]);

  return (
    <Container>
      <HeaderContatiner>
        <TopHeader>
          <Link to="/">
            <img src="/imgs/Logo.svg" alt="logo"></img>
          </Link>
          <NotiUserContainer>
            <NotiButton>
              <img src="/icons/Notification.svg" alt="notification_icon" width="24"></img>
            </NotiButton>
            <UserButton onClick={() => setIsModalOpen(true)}>
              <img src="/icons/User.svg" alt="user_icon" width="24"></img>
            </UserButton>
          </NotiUserContainer>
          {isModalOpen && isLogin && (
            <LoginNavModal ref={modalRef}>
              <Link to="/mypage">마이페이지</Link>
              <button>로그아웃</button>
            </LoginNavModal>
          )}
        </TopHeader>
        <NavBar>
          {NavItem.map((nav) => (
            <NavBarButton key={nav.text} link={nav.link}>
              {nav.text}
            </NavBarButton>
          ))}
        </NavBar>
      </HeaderContatiner>
    </Container>
  );
};

export default NavHeader;

const Container = styled.header`
  display: flex;
  justify-content: center;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
`;
const HeaderContatiner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 84px;
  padding: 12px 12px 0;
  background-color: white;
  max-width: 600px;
  box-shadow: ${(props) => props.theme.shadow.onlyBottom};
`;

const TopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotiUserContainer = styled.nav`
  display: flex;
  gap: 12px;
`;

const NotiButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background-color: white;
  cursor: pointer;
`;

const UserButton = styled.button`
  border: none;
  background-color: white;
  cursor: pointer;
`;

const LoginNavModal = styled.nav`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 999;
  width: 100px;
  height: 80px;
  border-radius: 8px;
  background-color: white;
  box-shadow: ${(props) => props.theme.shadow.dp01};
`;

const NavBar = styled.nav`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-around;
`;
