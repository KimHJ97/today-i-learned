# 댓글, 태그 기능 개발

 - __게시글(Post) 엔티티__
    - 속성: id(PK), name, content, createTime, postId(FK), tagId(FK)
    - 관계: 여러 댓글(comment)을 가질 수 있음(1:N), 여러 태그(tag)를 가질 수 있음(N:M)
 - __댓글(Comment) 엔티티__
    - 속성: id(PK), postId(FK), content, createdTime
    - 관계: 하나의 게시글(post)에 속함(N:1)
 - __태그(Tag) 엔티티__
    - 속성: url, name
    - 관계: 여러 게시글(post)에 속할 수 있음(M:N)

<br/>

## 해시태그 기능

 - `PostController`
```java
@RestController
@RequestMapping("/posts")
@Log4j2
public class PostController {

    private final PostServiceImpl postService;
    private final UserServiceImpl userService;

    public PostController(PostServiceImpl postService, UserServiceImpl userService) {
        this.postService = postService;
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @LoginCheck(type = LoginCheck.UserType.USER)
    public ResponseEntity<CommonResponse<PostDTO>> registerPost(String accountId, @RequestBody PostDTO postDTO) {
        postService.register(accountId, postDTO);
        CommonResponse commonResponse = new CommonResponse<>(HttpStatus.OK, "SUCCESS", "registerPost", postDTO);
        return ResponseEntity.ok(commonResponse);
    }

    @GetMapping("my-posts")
    @LoginCheck(type = LoginCheck.UserType.USER)
    public ResponseEntity<CommonResponse<List<PostDTO>>> myPostInfo(String accountId) {
        UserDTO memberInfo = userService.getUserInfo(accountId);
        List<PostDTO> postDTOList = postService.getMyProducts(memberInfo.getId());
        CommonResponse commonResponse = new CommonResponse<>(HttpStatus.OK, "SUCCESS", "myPostInfo", postDTOList);
        return ResponseEntity.ok(commonResponse);
    }

    @PatchMapping("{postId}")
    @LoginCheck(type = LoginCheck.UserType.USER)
    public ResponseEntity<CommonResponse<PostRequest>> updatePosts(String accountId,
                               @PathVariable(name = "postId") int postId,
                               @RequestBody PostRequest postRequest) {
        UserDTO memberInfo = userService.getUserInfo(accountId);
        PostDTO postDTO = PostDTO.builder()
                .id(postId)
                .name(postRequest.getName())
                .contents(postRequest.getContents())
                .views(postRequest.getViews())
                .categoryId(postRequest.getCategoryId())
                .userId(memberInfo.getId())
                .fileId(postRequest.getFileId())
                .updateTime(new Date())
                .build();
        postService.updateProducts(postDTO);
        CommonResponse commonResponse = new CommonResponse<>(HttpStatus.OK, "SUCCESS", "updatePosts", postDTO);
        return ResponseEntity.ok(commonResponse);
    }

    @DeleteMapping("{postId}")
    @LoginCheck(type = LoginCheck.UserType.USER)
    public ResponseEntity<CommonResponse<PostDeleteRequest>> deleteposts(String accountId,
                               @PathVariable(name = "postId") int postId,
                               @RequestBody PostDeleteRequest postDeleteRequest) {
        UserDTO memberInfo = userService.getUserInfo(accountId);
        postService.deleteProduct(memberInfo.getId(), postId);
        CommonResponse commonResponse = new CommonResponse<>(HttpStatus.OK, "SUCCESS", "deleteposts", postDeleteRequest);
        return ResponseEntity.ok(commonResponse);
    }

    // -------------- comments --------------

    @PostMapping("comments")
    @ResponseStatus(HttpStatus.CREATED)
    @LoginCheck(type = LoginCheck.UserType.USER)
    public ResponseEntity<CommonResponse<CommentDTO>> registerPostComment(String accountId, @RequestBody CommentDTO commentDTO) {
        postService.registerComment(commentDTO);
        CommonResponse commonResponse = new CommonResponse<>(HttpStatus.OK, "SUCCESS", "registerPostComment", commentDTO);
        return ResponseEntity.ok(commonResponse);
    }

    @PatchMapping("comments/{commentId}")
    @LoginCheck(type = LoginCheck.UserType.USER)
    public ResponseEntity<CommonResponse<CommentDTO>> updatePostComment(String accountId,
                                                                   @PathVariable(name = "commentId") int commentId,
                                                                   @RequestBody CommentDTO commentDTO) {
        UserDTO memberInfo = userService.getUserInfo(accountId);
        if(memberInfo != null)
            postService.updateComment(commentDTO);
        CommonResponse commonResponse = new CommonResponse<>(HttpStatus.OK, "SUCCESS", "updatePostComment", commentDTO);
        return ResponseEntity.ok(commonResponse);
    }

    @DeleteMapping("comments/{commentId}")
    @LoginCheck(type = LoginCheck.UserType.USER)
    public ResponseEntity<CommonResponse<CommentDTO>> deletePostComment(String accountId,
                                                                         @PathVariable(name = "commentId") int commentId,
                                                                         @RequestBody CommentDTO commentDTO) {
        UserDTO memberInfo = userService.getUserInfo(accountId);
        if(memberInfo != null)
          postService.deletePostComment(memberInfo.getId(), commentId);
        CommonResponse commonResponse = new CommonResponse<>(HttpStatus.OK, "SUCCESS", "deletePostComment", commentDTO);
        return ResponseEntity.ok(commonResponse);
    }

    // -------------- tags --------------
    @PostMapping("tags")
    @ResponseStatus(HttpStatus.CREATED)
    @LoginCheck(type = LoginCheck.UserType.USER)
    public ResponseEntity<CommonResponse<TagDTO>> registerPostTag(String accountId, @RequestBody TagDTO tagDTO) {
        postService.registerTag(tagDTO);
        CommonResponse commonResponse = new CommonResponse<>(HttpStatus.OK, "SUCCESS", "registerPostTag", tagDTO);
        return ResponseEntity.ok(commonResponse);
    }

    @PatchMapping("tags/{tagId}")
    @LoginCheck(type = LoginCheck.UserType.USER)
    public ResponseEntity<CommonResponse<TagDTO>> updatePostTag(String accountId,
                                                                        @PathVariable(name = "tagId") int tagId,
                                                                        @RequestBody TagDTO tagDTO) {
        UserDTO memberInfo = userService.getUserInfo(accountId);
        if(memberInfo != null)
            postService.updateTag(tagDTO);
        CommonResponse commonResponse = new CommonResponse<>(HttpStatus.OK, "SUCCESS", "updatePostTag", tagDTO);
        return ResponseEntity.ok(commonResponse);
    }

    @DeleteMapping("tags/{tagId}")
    @LoginCheck(type = LoginCheck.UserType.USER)
    public ResponseEntity<CommonResponse<TagDTO>> deletePostTag(String accountId,
                                                                        @PathVariable(name = "tagId") int tagId,
                                                                        @RequestBody TagDTO tagDTO) {
        UserDTO memberInfo = userService.getUserInfo(accountId);
        if(memberInfo != null)
            postService.deletePostTag(memberInfo.getId(), tagId);
        CommonResponse commonResponse = new CommonResponse<>(HttpStatus.OK, "SUCCESS", "deletePostTag", tagDTO);
        return ResponseEntity.ok(commonResponse);
    }

    // -------------- response 객체 --------------

    @Getter
    @AllArgsConstructor
    private static class PostResponse {
        private List<PostDTO> postDTO;
    }

    // -------------- request 객체 --------------

    @Setter
    @Getter
    private static class PostRequest {
        private String name;
        private String contents;
        private int views;
        private int categoryId;
        private int userId;
        private int fileId;
        private Date updateTime;
    }

    @Setter
    @Getter
    private static class PostDeleteRequest {
        private int id;
        private int accountId;
    }
}
```

 - `PostServiceImpl`
```java
@Service
@Log4j2
public class PostServiceImpl implements PostService {

    @Autowired
    private PostMapper postMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private UserProfileMapper userProfileMapper;

    // 게시글 조회
    @CacheEvict(value="getProducts", allEntries = true)
    @Override
    public void register(String id, PostDTO postDTO) {
        UserDTO memberInfo = userProfileMapper.getUserProfile(id);
        postDTO.setUserId(memberInfo.getId());
        postDTO.setCreateTime(new Date());

        if (memberInfo != null) {
            postMapper.register(postDTO);
            Integer postId = postDTO.getId();
            // 생성된 post 객체 에서 태그 리스트 생성
            for(int i=0; i<postDTO.getTagDTOList().size(); i++){
                TagDTO tagDTO = postDTO.getTagDTOList().get(i);
                tagMapper.register(tagDTO);
                Integer tagId = tagDTO.getId();
                // M:N 관계 테이블 생성
                tagMapper.createPostTag(tagId, postId);
            }
        } else {
            log.error("register ERROR! {}", postDTO);
            throw new RuntimeException("register ERROR! 상품 등록 메서드를 확인해주세요\n" + "Params : " + postDTO);
        }
    }

    @Override
    public List<PostDTO> getMyProducts(int accountId) {
        List<PostDTO> postDTOList = postMapper.selectMyProducts(accountId);
        return postDTOList;
    }

    // 게시글 수정
    @Override
    public void updateProducts(PostDTO postDTO) {
        if (postDTO != null && postDTO.getId() != 0 && postDTO.getUserId() != 0) {
            postMapper.updateProducts(postDTO);
        } else {
            log.error("updateProducts ERROR! {}", postDTO);
            throw new RuntimeException("updateProducts ERROR! 물품 변경 메서드를 확인해주세요\n" + "Params : " + postDTO);
        }
    }

    // 게시글 삭제
    @Override
    public void deleteProduct(int userId, int productId) {
        if (userId != 0 && productId != 0) {
            postMapper.deleteProduct(productId);
        } else {
            log.error("deleteProudct ERROR! {}", productId);
            throw new RuntimeException("updateProducts ERROR! 물품 삭제 메서드를 확인해주세요\n" + "Params : " + productId);
        }
    }

    // 댓글 등록
    @Override
    public void registerComment(CommentDTO commentDTO) {
        if (commentDTO.getPostId() != 0) {
            commentMapper.register(commentDTO);
        } else {
            log.error("registerComment ERROR! {}", commentDTO);
            throw new RuntimeException("registerComment ERROR! 댓글 추가 메서드를 확인해주세요\n" + "Params : " + commentDTO);
        }
    }

    // 댓글 수정
    @Override
    public void updateComment(CommentDTO commentDTO) {
        if (commentDTO != null) {
            commentMapper.updateComments(commentDTO);
        } else {
            log.error("updateComment ERROR! {}", commentDTO);
            throw new RuntimeException("updateComment ERROR! 댓글 변경 메서드를 확인해주세요\n" + "Params : " + commentDTO);
        }
    }

    // 댓글 삭제
    @Override
    public void deletePostComment(int userId, int commentId) {
        if (userId != 0 && commentId != 0) {
            commentMapper.deletePostComment(commentId);
        } else {
            log.error("deletePostComment ERROR! {}", commentId);
            throw new RuntimeException("deletePostComment ERROR! 댓글 삭제 메서드를 확인해주세요\n" + "Params : " + commentId);
        }
    }

    // 태그 등록
    @Override
    public void registerTag(TagDTO tagDTO) {
        if (tagDTO.getPostId() != 0) {
            tagMapper.register(tagDTO);
        } else {
            log.error("registerTag ERROR! {}", tagDTO);
            throw new RuntimeException("registerTag ERROR! 태그 추가 메서드를 확인해주세요\n" + "Params : " + tagDTO);
        }
    }

    // 태그 수정
    @Override
    public void updateTag(TagDTO tagDTO) {
        if (tagDTO != null) {
            tagMapper.updateTags(tagDTO);
        } else {
            log.error("updateTag ERROR! {}", tagDTO);
            throw new RuntimeException("updateTag ERROR! 태그 변경 메서드를 확인해주세요\n" + "Params : " + tagDTO);
        }
    }

    // 태그 삭제
    @Override
    public void deletePostTag(int userId, int tagId) {
        if (userId != 0 && tagId != 0) {
            tagMapper.deletePostTag(tagId);
        } else {
            log.error("deletePostTag ERROR! {}", tagId);
            throw new RuntimeException("deletePostTag ERROR! 태그 삭제 메서드를 확인해주세요\n" + "Params : " + tagId);
        }
    }
}
```

