package com.fastcampus.boardserver.mapper;


import com.fastcampus.boardserver.dto.UserDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserProfileMapper {
    UserDTO getUserProfile(@Param("id") String id);

    int insertUserProfile(@Param("id") String id, @Param("password") String password, @Param("name") String name, @Param("phone") String phone, @Param("address") String address);

    int updateUserProfile(@Param("id") String id, @Param("password") String password, @Param("name") String name, @Param("phone") String phone, @Param("address") String address);

    int deleteUserProfile(@Param("id") String id);

    int register(UserDTO userDTO);

    UserDTO findByIdAndPassword(@Param("id") String id,
                                       @Param("password") String password);

    int idCheck(String id);

    int updatePassword(UserDTO userDTO);

    int updateAddress(UserDTO userDTO);
}