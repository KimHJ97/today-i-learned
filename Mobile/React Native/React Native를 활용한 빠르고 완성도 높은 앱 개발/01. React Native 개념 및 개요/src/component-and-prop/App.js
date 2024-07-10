import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";

/**
 * Header
 * MyProfile
 * Division
 * FriendSection
 * FriendList
 */

const Header = (props) => {
  return <Text>{props.title}</Text>;
};
const MyProfile = () => {
  return (
    <Profile
      name="지은"
      uri="https://shop.peopet.co.kr/data/goods/31/2021/11/4953_tmp_0f4c02bad88abd5ec334e3dff1cc92bc2245view.jpg"
      profileSize={40}
    />
  );
};
const Division = () => {
  return <Text>Division</Text>;
};
const FriendSection = () => {
  return <Text>FriendSection</Text>;
};
const FriendList = () => {
  return (
    <View>
      <Profile
        name="지연"
        uri="https://s3.ap-northeast-2.amazonaws.com/elasticbeanstalk-ap-northeast-2-176213403491/media/magazine_img/magazine_262/%EC%8D%B8%EB%84%A4%EC%9D%BC.jpg"
        profileSize={30}
      />
      <Profile
        name="세인"
        uri="https://shop.peopet.co.kr/data/goods/31/2021/11/4953_tmp_0f4c02bad88abd5ec334e3dff1cc92bc2245view.jpg"
        profileSize={30}
      />
      <Profile
        name="지현"
        uri="https://shop.peopet.co.kr/data/goods/31/2021/11/4953_tmp_0f4c02bad88abd5ec334e3dff1cc92bc2245view.jpg"
        profileSize={30}
      />
      <Profile
        name="현서"
        uri="https://shop.peopet.co.kr/data/goods/31/2021/11/4953_tmp_0f4c02bad88abd5ec334e3dff1cc92bc2245view.jpg"
        profileSize={30}
      />
      <Profile
        name="유림"
        uri="https://shop.peopet.co.kr/data/goods/31/2021/11/4953_tmp_0f4c02bad88abd5ec334e3dff1cc92bc2245view.jpg"
        profileSize={30}
      />
    </View>
  );
};
/**
 * Functional Component
 */
const Profile = (props) => {
  return (
    <View style={{ flexDirection: "row" }}>
      <Image
        source={{
          uri: props.uri,
        }}
        style={{
          width: props.profileSize,
          height: props.profileSize,
        }}
      />
      <Text>{props.name}</Text>
    </View>
  );
};
/**
 * Class Component
 */
// class Profile extends React.Component {
//   render() {
//     return (
//       <View style={{ flexDirection: "row" }}>
//         <Image
//           source={{
//             uri: this.props.uri,
//           }}
//           style={{
//             width: this.props.profileSize,
//             height: this.props.profileSize,
//           }}
//         />
//         <Text>{this.props.name}</Text>
//       </View>
//     );
//   }
// }

export default function App() {
  return (
    <View style={styles.container}>
      <Header title="친구" />
      <MyProfile />
      <Division />
      <FriendSection />
      <FriendList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
