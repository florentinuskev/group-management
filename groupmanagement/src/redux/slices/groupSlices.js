import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios';

export const groupSlice = createSlice({
    name: 'group',
    initialState: {
        list: [],
        ownGroup: {
            id: '',
            name: '',
            topic: '',
            description: '',
            requirements: '',
            ownerId: '',
            members: [],
            sprints: [],
            tags: []
        },
        bookmarkedGroup: [],
        joinGroupRequest: [],
        groupProposal: {
            progress: "ON_REVIEW",
            feedback: "",
        },
        groupProposalList: [
            {
                id: 1,
                groupId: 2,
                approved: "PENDING",
            }
        ],
        ownRequestJoin: [

        ]
    },
    reducers: {
        onGetGroup: (state, action) => {
            state.list = action.payload.groups
            console.log("Groups: ", state.list.length)
        },
        onGetOwnGroup: (state, action) => {
            if (action.payload == null) {
                state.ownGroup = {
                    id: '',
                    name: '',
                    topic: '',
                    description: '',
                    requirements: '',
                    ownerId: '',
                    members: [],
                    sprints: [],
                    tags: []
                }
            } else {
                state.ownGroup = {
                    id: action.payload.id,
                    name: action.payload.name,
                    topic: action.payload.topic,
                    description: action.payload.description,
                    tags: action.payload.Tags,
                    requirements: action.payload.requirements,
                    members: action.payload.Members,
                    ownerId: action.payload.ownerId,
                    sprints: action.payload.Sprints
                }
            }

        },
        setBookmark: (state, action) => {
            if (action.payload == null) {
                state.bookmarkedGroup = []
            } else {
                state.bookmarkedGroup = action.payload
            }

        },
        setJoinGroupReq: (state, action) => {
            state.joinGroupRequest = action.payload
        },
        setOwnRequest: (state, action) => {
            state.ownRequestJoin = action.payload
        },
        setAcceptJoinGroupReq: (state, action) => {
            const req = state.joinGroupRequest.find((req) => req.id === action.payload)
            if (req) {
                req.approved = true
            }
        },
        setDeclineJoinGroupReq: (state, action) => {
            const req = state.joinGroupRequest.find((req) => req.id === action.payload)
            if (req) {
                req.approved = false
            }
        },
        setConfirmJoin: (state, action) => {
            state.ownRequestJoin.map(req => {
                if (req.approved == null) {
                    res.approved == false
                }
            })
        },
        editGroup: (state, action) => {
            state.ownGroup = { ...state.ownGroup, ...action.payload }
        }
    }
})

export const {
    onGetGroup,
    onGetOwnGroup,
    setBookmark,
    setOwnRequest,
    setJoinGroupReq,
    setAcceptJoinGroupReq,
    setDeclineJoinGroupReq,
    setConfirmJoin,
    editGroup } = groupSlice.actions

export default groupSlice.reducer

export const getAllGroupAction = () => {
    return async dispatch => {
        try {
            const res = await axios.get("http://10.10.10.124:3002/api/v1/group/get-all-group")
            console.log(res.data.groups)
            dispatch(onGetGroup({ groups: res.data.groups }))
        } catch (err) {
            alert(err)
        }
    }
}

export const createGroupAction = (name, topic, description, tags, requirements, navigation) => {
    return async dispatch => {
        try {
            console.log(name, topic, description, tags, requirements)
            const res = await axios.post("http://10.10.10.124:3002/api/v1/group/create-group", {
                name,
                topic,
                description,
                tags,
                requirements
            })
            if (res.data.STATUS == "CREATE_GROUP_SUCCESS") {
                dispatch(getOwnGroupAction())
                navigation.navigate("Group")
            } else {
                console.log("OWNING A GROUP")
            }
        } catch (err) {
            alert(err)
        }
    }
}
export const getOwnGroupAction = () => {
    return async dispatch => {
        try {
            const res = await axios.get("http://10.10.10.124:3002/api/v1/group/get-own-group")
            if (res.data.STATUS == "GET_OWN_GROUP_SUCCESS") {
                dispatch(onGetOwnGroup(res.data.GROUP))
            } else if (res.data.STATUS == "GET_OWN_GROUP_NOT_EXISTS") {
                dispatch(onGetOwnGroup(null))
            }
        } catch (err) {
            alert(err)
        }
    }
}

export const editGroupAction = (newGroupDetails) => {
    return async dispatch => {
        try {
            const res = await axios.patch("http://10.10.10.124:3002/api/v1/group/edit-group", newGroupDetails)
            if (res.data.STATUS == "GROUP_EDIT_SUCCESS") {
                dispatch(editGroup(newGroupDetails))
            } else {
                throw res.data
            }
        } catch (err) {
            alert(err)
        }
    }
}

// Group Membership Actions
export const getOwnJoinRequestAction = () => {
    return async dispatch => {
        try {
            const res = await axios.get("http://10.10.10.124:3002/api/v1/group/get-own-request")
            dispatch(setOwnRequest(res.data.REQUESTS))
        } catch (err) {
            alert(err.response)
        }
    }
}

export const getJoinGroupReqAction = () => {
    return async dispatch => {
        try {
            const res = await axios.get("http://10.10.10.124:3002/api/v1/group/get-request-join-group")
            console.log(res.data.Requests)
            dispatch(setJoinGroupReq(res.data.Requests))
        } catch (err) {
            console.log(err)
            alert(err.response)
        }
    }
}

export const joinGroupAction = (groupId) => {
    return async (dispatch, getState) => {
        try {
            if (getState().auth.groupId == null) {
                const res = await axios.post("http://10.10.10.124:3002/api/v1/group/join-group", { groupId: groupId })
                console.log(res.data.result)
                if (res.data.STATUS == "JOIN_GROUP_REQUEST_SUCCESS") {
                    alert("Successfully request to join a group, check the progress at messages screen!")
                } else {
                    alert("Failed to join the group, please try again!")
                }
            } else {
                alert("You are in a group, please leave or delete your group.")
            }
        } catch (err) {
            alert(err.response.data.MESSAGE)
        }
    }
}

export const leaveGroupAction = () => {
    return async dispatch => {
        try {
            const res = await axios.patch("http://10.10.10.124:3002/api/v1/group/leave-group")
            if (res.data.STATUS == "LEAVE_GROUP_SUCCESS") {
                dispatch(onGetGroup(null))
            } else {
                throw err
            }
        } catch (err) {
            alert(err.response)
        }
    }
}

export const acceptJoinGroupAction = (id) => {
    return async dispatch => {
        try {
            console.log(id)
            const res = await axios.patch("http://10.10.10.124:3002/api/v1/group/accept-join-group", { joinId: id })
            console.log(res.data)
            dispatch(setAcceptJoinGroupReq(id))
        } catch (err) {
            alert(err)
        }
    }
}

export const declineJoinGroupAction = (id) => {
    return async dispatch => {
        try {
            const res = await axios.post("http://10.10.10.124:3002/api/v1/group/decline-join-group", { joinId: id })
            dispatch(setDeclineJoinGroupReq(id))
        } catch (err) {
            alert(err.response)
        }
    }
}

export const confirmJoinAction = (id) => {
    return async dispatch => {
        try {
            console.log("triggered")
            const res = await axios.patch("http://10.10.10.124:3002/api/v1/group/confirm-join-group", { joinId: id })
            if (res.data.STATUS == "CONFIRM_JOIN_SUCCESS") {
                dispatch(setConfirmJoin())
                dispatch(getOwnGroupAction())
            }
        } catch (err) {
            console.log(err)
            alert(err.repsonse)
        }
    }
}

//  Group Proposal System

export const sendGroupProposalAction = () => {
    return async dispatch => {
        try {

        } catch (err) {

        }
    }
}

export const getGroupProposalAction = () => {
    return async dispatch => {
        try {

        } catch (err) {

        }
    }
}

export const acceptGroupProposalAction = () => {
    return async dispatch => {
        try {

        } catch (err) {

        }
    }
}

export const declineGroupProposalAction = () => {
    return async dispatch => {
        try {

        } catch (err) {

        }
    }
}

//  Bookmark actions
export const addUserBookmarkAction = (groupId) => {
    return async dispatch => {
        try {
            console.log(groupId)
            const bookmarked = await AsyncStorage.getItem("Bookmark")

            if (bookmarked == null) {
                await AsyncStorage.setItem("Bookmark", JSON.stringify([groupId]))
            } else {
                const restoredBookmark = JSON.parse(bookmarked)
                const newBookmark = [...restoredBookmark, groupId]
                await AsyncStorage.setItem("Bookmark", JSON.stringify(newBookmark))
            }
            const afterAdd = await AsyncStorage.getItem("Bookmark")
            dispatch(setBookmark(afterAdd))
        } catch (err) {
            alert(err)
        }
    }
}
export const deleteUserBookmarkAction = (delGroupId) => {
    return async dispatch => {
        try {
            const bookmarked = await AsyncStorage.getItem("Bookmark")
            const bookmarkParsed = JSON.parse(bookmarked)
            const afterDelete = bookmarkParsed.filter(groupId => {
                return groupId != delGroupId
            })
            await AsyncStorage.setItem("Bookmark", JSON.stringify(afterDelete))
            dispatch(setBookmark(afterDelete))
        } catch (err) {
            alert(err)
        }
    }
}
export const getUserBookmarkAction = () => {
    return async dispatch => {
        try {
            const bookmarked = await AsyncStorage.getItem("Bookmark")
            dispatch(setBookmark(bookmarked))
        } catch (err) {
            alert(err)
        }
    }
}