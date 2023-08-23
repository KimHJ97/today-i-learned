package com.hello.inflearnthejavatest.member;

import com.hello.inflearnthejavatest.domain.Member;
import com.hello.inflearnthejavatest.domain.Study;

import java.util.Optional;

public interface MemberService {

    Optional<Member> findById(Long memberId);

    void validate(Long memberId);

    void notify(Study newstudy);

    void notify(Member member);
}
