export type UserRole = 'admin' | 'user';
export type RevisionStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type CompetitionStatus =
  'draft' | 'open' | 'first_round' | 'second_round' | 'tie_break' | 'completed' | 'cancelled' | 'no_qualified';
export type VoteDecision = 'accept' | 'reject';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: number;
  firstName: string;
  lastName: string;
}

export interface StoryType {
  id: number;
  name: string;
  slug: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Chapter {
  id?: number;
  position: number;
  title: string;
  content: string;
}

export interface Revision {
  id: number;
  work?: Work;
  title: string;
  status: RevisionStatus;
  version: number;
  createdBy?: User;
  reviewedBy?: User | null;
  reviewMessage?: string | null;
  chapters: Chapter[];
  createdAt: string;
}

export interface Work {
  id: number;
  user?: User;
  type?: StoryType;
  revisions: Revision[];
  publishedRevision?: Revision | null;
  publishedRevisionId?: number | null;
  genres: Genre[];
  likes?: Like[];
  comments?: Comment[];
  createdAt: string;
}

export interface Like {
  id: number;
  user?: User;
  work?: Work;
  likedAt: string;
}

export interface Comment {
  id: number;
  user: User;
  work?: Work;
  content: string;
  postedAt: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthenticateDto {
  phone: string;
}

export interface VerifyOtpDto {
  phone: string;
  code: string;
}

export interface AuthResponse {
  token: string;
}

export interface ChapterInput {
  position?: number;
  title: string;
  content: string;
}

export interface CreateRevisionDto {
  title: string;
  typeId: number;
  genres?: number[];
  chapters: ChapterInput[];
}

export interface UpdateRevisionDto {
  title?: string;
  chapters?: ChapterInput[];
}

export interface CreateGenreDto {
  name: string;
}

export interface UpdateGenreDto {
  name?: string;
}

export interface CreateStoryTypeDto {
  name: string;
  slug?: string;
}

export interface UpdateStoryTypeDto {
  name?: string;
  slug?: string;
}

export interface RejectRevisionDto {
  reason: string;
}

export interface CreateCommentDto {
  content: string;
}

export interface CompetitionCriterion {
  id: number;
  name: string;
  minScore: number;
  maxScore: number;
  weight: number;
  sortOrder: number;
}

export interface CompetitionJudge {
  id?: number;
  user: PublicUser | User | null;
  isFirstRound: boolean;
  isSecondRound: boolean;
  assignedBy?: User;
  assignedAt?: string;
}

export interface FirstRoundVote {
  id: number;
  judge?: User;
  decision: VoteDecision;
  rejectReason?: string | null;
  submittedAt: string;
}

export interface SecondRoundScore {
  id: number;
  criterion?: CompetitionCriterion;
  score: number;
}

export interface SecondRoundEvaluation {
  id: number;
  judge?: User;
  scoringPass: number;
  weightedTotal: number;
  scores?: SecondRoundScore[];
  submittedAt: string;
}

export interface CompetitionEntry {
  id: number;
  title: string;
  content: string;
  type?: StoryType;
  author?: PublicUser | User | null;
  submittedAt: string;
  rank?: number | null;
  advancedToSecondRound?: boolean;
  isInTieBreak?: boolean;
  finalScore?: number | null;
  isPublic?: boolean;
  votes?: FirstRoundVote[];
  evaluations?: SecondRoundEvaluation[];
}

export interface Competition {
  id: number;
  name: string;
  description: string;
  status: CompetitionStatus;
  applicationDeadline: string;
  firstRoundJudgeCount?: number;
  minAcceptVotes?: number;
  cutoffScore?: number;
  allowFirstRoundJudgesInSecondRound: boolean;
  allowedTypes?: StoryType[];
  criteria?: CompetitionCriterion[];
  judges?: CompetitionJudge[];
  entries?: CompetitionEntry[];
  createdBy?: User;
  publishedAt?: string | null;
  firstRoundStartedAt?: string | null;
  firstRoundCompletedAt?: string | null;
  secondRoundStartedAt?: string | null;
  secondRoundCompletedAt?: string | null;
  tieBreakStartedAt?: string | null;
  tieBreakCompletedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompetitionDto {
  name: string;
  description: string;
  applicationDeadline: string;
  firstRoundJudgeCount: number;
  minAcceptVotes: number;
  cutoffScore: number;
  allowFirstRoundJudgesInSecondRound?: boolean;
  allowedTypeIds?: number[];
}

export type UpdateCompetitionDto = Partial<CreateCompetitionDto>;

export interface CreateCriterionDto {
  name: string;
  minScore: number;
  maxScore: number;
  weight: number;
  sortOrder: number;
}

export type UpdateCriterionDto = Partial<CreateCriterionDto>;

export interface AssignJudgeDto {
  userId: number;
  isFirstRound?: boolean;
  isSecondRound?: boolean;
}

export interface CreateEntryDto {
  typeId: number;
  title: string;
  content: string;
}

export interface SubmitVoteDto {
  decision: VoteDecision;
  rejectReason?: string;
}

export interface SubmitScoresDto {
  scores: { criterionId: number; score: number }[];
}

export interface JudgeEntriesResponse {
  competition: Competition;
  entries: CompetitionEntry[];
}

export interface AuditLog {
  id: number;
  actor?: PublicUser | User | null;
  action: string;
  entityType: string;
  entityId: number | null;
  payload?: Record<string, unknown> | null;
  createdAt: string;
}

export interface BooksResponse {
  items: {
    current_page: number;
    data: Book[];
    to: number;
  };
  total: number;
}

export interface BookResponse {
  items: Book;
}

export interface Book {
  id: number;
  name: string;
  description: string | null;
  intro_image: string;
  min_limit: number;
  qty: number;
  price: number;
  special_price: number;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  brand_id: number;
  images: unknown | null;
  options: unknown | null;
  sizes: unknown | null;
  colors: unknown | null;
  attributes: unknown | null;
  slug: string;
  body: string | null;
  main_code: number;
  book_code: string;
  system_code: string;
  not_reserved: number | null;
  area_code: number | null;
  weight: string;
  circulation: string;
  published: string;
  book_type: string;
  main_topic: string;
  sub_topic: string;
  product_type: string;
  page_count: number;
  translator: string;
  author: string;
  author_id: number;
  translator_id: number | null;
  seenCount: number;
  sellCount: number;
  max_limit: number;
  intro_sunde: string | null;
  audio: string | null;
  video: string | null;
  extra_description: string | null;
  main_product_id: number;
  product_id: number | null;
  publish: string;
  publish_year: number;
  back_cover_price: number;
  isbn: string;
  cover_type: string;
  book_size: string;
  quantity: number;
  main_option_id: number;
  brand_name: string;
  publish_id: number;
  get_brand: {
    id: number;
    name: string;
    is_visible: boolean;
    main_order: number;
    created_at: string;
    updated_at: string;
    deleted_at: null;
  };
  dynamicAttributes: DynamicAttribute[];
}

export interface DynamicAttribute {
  id: number;
  product_id: number | null;
  publish: string;
  publish_year: number;
  back_cover_price: number;
  isbn: string;
  cover_type: string;
  book_size: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  book_code: string;
  published: string;
  special_price: number | null;
  weight: string;
  system_code: string;
  quantity: number;
  main_code: number;
}
