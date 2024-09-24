# Git Flow #

Intended for the paradigm under which I am the sole developer on the regional project.

There shall be one master branch and many version branches. A version branch above the master branch version shall be considered one in active development. When a new version is complete, it will be merged back into master. This is a simple, linear model that will naturally scale poorly if development picks up heavily in tempo. In that eventuality the project shall switch to common git-flow with master/development/feature/release branches.

# New Version Steps #
1. Branch master into a new version branch named 'v_1.2.3'
2. Update version number in justfile in new branch.
3. Make whatever code changes are needed.
4. Commit etc.
5. Merge new version branch back into master.
>> Production is now at v_1.2.3.